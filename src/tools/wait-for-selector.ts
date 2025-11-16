import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Wait for an element to appear in the DOM
 */
const waitForSelector = async (url: string, selector: string, timeout: number = 30000, headless: boolean = true) => {
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

        await printInConsole(transport, `Waiting for selector: ${selector} (timeout: ${timeout}ms)...`);

        let elementFound = false;
        let errorMessage = '';

        try {
            await page.waitForSelector(selector, {timeout, visible: true});
            elementFound = true;
            await printInConsole(transport, `Element found: ${selector}`);
        } catch (error: any) {
            errorMessage = error.message;
            await printInConsole(transport, `Timeout waiting for element: ${selector}`);
        }

        // Wait a bit for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500));

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
            success: elementFound,
            selector,
            found: elementFound,
            url: currentUrl,
            content: {
                title,
                text,
                screenshot,
            },
            loadTime,
            errorMessage: elementFound ? undefined : errorMessage,
        };
    } catch (error: any) {
        await page.close().catch(() => {
        });
        browserPool.releaseBrowser({headless});
        throw error;
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.waitForSelector;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const selectorParam = toolConfig.parameters.find(p => p.name === 'selector');
    const timeoutParam = toolConfig.parameters.find(p => p.name === 'timeout');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                selector: z.string().describe(selectorParam?.techDescription || ''),
                timeout: z.number().optional().describe(timeoutParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, selector, timeout, headless} = args;
            try {
                const result = await waitForSelector(url, selector, timeout, headless);

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `${result.found ? 'Successfully found' : 'Timeout waiting for'} element: ${selector}\n\nURL: ${result.url}\nTitle: ${result.content.title}\n\nElement found: ${result.found ? 'Yes' : 'No'}\nLoad time: ${result.loadTime}ms${result.errorMessage ? `\nError: ${result.errorMessage}` : ''}\n\nVisible text:\n${result.content.text.substring(0, 2000)}${result.content.text.length > 2000 ? '...(truncated)' : ''}`,
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
                            text: `Failed to wait for selector on ${url}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
