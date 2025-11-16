import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Navigate to URL and extract page content
 */
const browsePage = async (url: string, headless: boolean = true, timeout: number = 30000) => {
    const startTime = Date.now();

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

        const text = await page.evaluate(() => {
            return document.body.innerText;
        });

        await printInConsole(transport, `Capturing screenshots...`);

        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const viewportHeight = 1080;

        let screenshotsNeeded = Math.ceil(pageHeight / (viewportHeight * 2));
        const MAX_SCREENSHOTS = 8;

        if (screenshotsNeeded > MAX_SCREENSHOTS) {
            screenshotsNeeded = MAX_SCREENSHOTS;
            await printInConsole(transport, `Page is very long (${pageHeight}px), limiting to ${MAX_SCREENSHOTS} screenshots`);
        }

        const screenshots: string[] = [];

        let quality: number;
        if (screenshotsNeeded <= 3) {
            quality = 85;
        } else if (screenshotsNeeded <= 5) {
            quality = 65;
        } else {
            quality = 50;
        }

        await printInConsole(transport, `Page height: ${pageHeight}px, capturing ${screenshotsNeeded} screenshot(s) at ${quality}% quality...`);

        const scrollStep = screenshotsNeeded > 1 ? (pageHeight - viewportHeight) / (screenshotsNeeded - 1) : 0;

        for (let i = 0; i < screenshotsNeeded; i++) {
            const scrollY = i === 0 ? 0 : Math.min(i * scrollStep, pageHeight - viewportHeight);
            await page.evaluate((scroll) => window.scrollTo(0, scroll), scrollY);

            await new Promise(resolve => setTimeout(resolve, 300));

            const screenshot = await page.screenshot({
                encoding: 'base64',
                fullPage: false,
                type: 'jpeg',
                quality,
            });

            screenshots.push(screenshot);
            await printInConsole(transport, `Captured screenshot ${i + 1}/${screenshotsNeeded}`);
        }

        const loadTime = Date.now() - startTime;

        await page.close();
        browserPool.releaseBrowser({headless});

        return {
            success: true,
            url,
            content: {
                title,
                text,
                screenshots,
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
    const toolConfig = tools.browsePage;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');
    const timeoutParam = toolConfig.parameters.find(p => p.name === 'timeout');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
                timeout: z.number().optional().describe(timeoutParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, headless, timeout} = args;
            try {
                const result = await browsePage(url, headless, timeout);

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `Successfully browsed ${url}\n\nTitle: ${result.content.title}\n\nLoad time: ${result.loadTime}ms\n\nCaptured ${result.content.screenshots.length} screenshot(s)\n\nVisible text:\n${result.content.text.substring(0, 2000)}${result.content.text.length > 2000 ? '...(truncated)' : ''}`,
                    },
                ];

                result.content.screenshots.forEach((screenshot, index) => {
                    content.push({
                        type: 'image' as const,
                        data: screenshot,
                        mimeType: 'image/jpeg',
                    });
                });

                return {content};
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to browse ${url} ❌: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
