import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {LinkInfo} from "../types";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Extract links from a page, optionally filtered by CSS selector
 */
const extractLinks = async (url: string, selector?: string, headless: boolean = true, timeout: number = 30000): Promise<LinkInfo[]> => {
    const browser = await browserPool.getBrowser({headless});
    const page = await browserPool.createPage(browser);

    try {
        await page.setUserAgent(constants.userAgent);
        await page.setViewport({width: 1920, height: 1080});

        await printInConsole(transport, `Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout,
        });

        const title = await page.title();
        await printInConsole(transport, `Page loaded: ${title}`);

        const selectorToUse = selector || 'a';
        await printInConsole(transport, `Extracting links with selector: ${selectorToUse}`);

        const links: LinkInfo[] = await page.evaluate((selector: string) => {
            const anchors = Array.from(document.querySelectorAll(selector));
            return anchors
                .filter((a): a is HTMLAnchorElement => a instanceof HTMLAnchorElement && !!a.href)
                .map((a, index) => ({
                    text: a.textContent?.trim() || a.innerText?.trim() || '',
                    href: a.href,
                    selector: `${selector}:nth-of-type(${index + 1})`,
                }));
        }, selectorToUse);

        await printInConsole(transport, `Found ${links.length} link(s)`);

        await page.close();
        browserPool.releaseBrowser({headless});

        return links;
    } catch (error: any) {
        await page.close().catch(() => {
        });
        browserPool.releaseBrowser({headless});
        throw error;
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.extractLinks;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const selectorParam = toolConfig.parameters.find(p => p.name === 'selector');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                selector: z.string().optional().describe(selectorParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, selector, headless} = args;
            try {
                const links = await extractLinks(url, selector, headless);

                const linksText = links.map((link, index) => {
                    return `${index + 1}. ${link.text || '[No text]'}\n   URL: ${link.href}\n   Selector: ${link.selector}`;
                }).join('\n\n');

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Successfully extracted ${links.length} link(s) from ${url}\n\n${linksText}`,
                        },
                    ],
                };
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to extract links from ${url} ❌: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
