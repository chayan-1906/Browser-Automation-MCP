import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Click an element and capture the resulting page state
 */
const clickElement = async (url: string, selector: string, waitTime: number = 1000, headless: boolean = true) => {
    const startTime = Date.now();

    const browser = await browserPool.getBrowser({headless});
    const page = await browserPool.createPage(browser);

    try {
        await page.setUserAgent(constants.userAgent);
        await page.setViewport({width: 1920, height: 1080});

        await printInConsole(transport, `Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        await printInConsole(transport, `Waiting for element: ${selector}`);
        await page.waitForSelector(selector, {timeout: 10000, visible: true});

        await printInConsole(transport, `Clicking element: ${selector}`);

        await Promise.all([
            page.waitForNavigation({waitUntil: 'networkidle2', timeout: 30000}).catch(() => {
            }), // Ignore if no navigation
            page.click(selector)
        ]);

        await printInConsole(transport, `Waiting ${waitTime}ms after click...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        const title = await page.title();
        const currentUrl = page.url();

        const text = await page.evaluate(() => {
            return document.body.innerText;
        });

        await printInConsole(transport, `Capturing screenshot...`);
        const screenshot = await page.screenshot({
            encoding: 'base64',
            fullPage: false,
            type: 'jpeg',
            quality: 85,
        });

        const loadTime = Date.now() - startTime;

        await page.close();
        browserPool.releaseBrowser({headless});

        return {
            success: true,
            clickedSelector: selector,
            originalUrl: url,
            currentUrl,
            urlChanged: url !== currentUrl,
            content: {
                title,
                text,
                screenshot,
            },
            loadTime,
        };
    } catch (error: any) {
        await page.close().catch(() => {
        });
        browserPool.releaseBrowser({headless});
        throw error;
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.clickElement;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const selectorParam = toolConfig.parameters.find(p => p.name === 'selector');
    const waitTimeParam = toolConfig.parameters.find(p => p.name === 'waitTime');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                selector: z.string().describe(selectorParam?.techDescription || ''),
                waitTime: z.number().optional().describe(waitTimeParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, selector, waitTime, headless} = args;
            try {
                const result = await clickElement(url, selector, waitTime, headless);

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `Successfully clicked element: ${selector}\n\nOriginal URL: ${result.originalUrl}\nCurrent URL: ${result.currentUrl}\nURL Changed: ${result.urlChanged ? 'Yes' : 'No'}\n\nTitle: ${result.content.title}\n\nLoad time: ${result.loadTime}ms\n\nVisible text:\n${result.content.text.substring(0, 2000)}${result.content.text.length > 2000 ? '...(truncated)' : ''}`,
                    },
                    {
                        type: 'image' as const,
                        data: result.content.screenshot,
                        mimeType: 'image/jpeg',
                    },
                ];

                return {content};
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to click element on ${url}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
