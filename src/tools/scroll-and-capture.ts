import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Scroll the page and capture newly visible content
 */
const scrollAndCapture = async (url: string, scrollDistance: string | number = 'bottom', headless: boolean = true) => {
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

        const title = await page.title();
        await printInConsole(transport, `Page loaded: ${title}`);

        await printInConsole(transport, `Capturing initial screenshot...`);
        const screenshotBefore = await page.screenshot({
            encoding: 'base64',
            fullPage: false,
            type: 'jpeg',
            quality: 85,
        });

        const textBefore = await page.evaluate(() => document.body.innerText);

        const initialPosition = await page.evaluate(() => window.scrollY);
        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        await printInConsole(transport, `Initial scroll position: ${initialPosition}px, Page height: ${pageHeight}px`);

        let scrollTarget: number;
        if (scrollDistance === 'bottom') {
            scrollTarget = pageHeight - viewportHeight;
            await printInConsole(transport, `Scrolling to bottom (${scrollTarget}px)...`);
        } else {
            const scrollPixels = typeof scrollDistance === 'string' ? parseInt(scrollDistance, 10) : scrollDistance;
            scrollTarget = Math.min(initialPosition + scrollPixels, pageHeight - viewportHeight);
            await printInConsole(transport, `Scrolling ${scrollPixels}px down to position ${scrollTarget}px...`);
        }

        // Perform smooth scroll
        await page.evaluate((target: number) => {
            window.scrollTo({
                top: target,
                behavior: 'smooth',
            });
        }, scrollTarget);

        // Wait for scroll to complete and content to load
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Wait for any lazy-loaded content
        await page.waitForNetworkIdle({timeout: 5000}).catch(() => {
            // Ignore timeout, some pages continuously load
        });

        const finalPosition = await page.evaluate(() => window.scrollY);
        await printInConsole(transport, `Final scroll position: ${finalPosition}px`);

        // Capture final state
        await printInConsole(transport, `Capturing final screenshot...`);
        const screenshotAfter = await page.screenshot({
            encoding: 'base64',
            fullPage: false,
            type: 'jpeg',
            quality: 85,
        });

        const textAfter = await page.evaluate(() => document.body.innerText);

        const loadTime = Date.now() - startTime;

        await page.close();
        browserPool.releaseBrowser({headless});

        return {
            success: true,
            url,
            scrollInfo: {
                initialPosition,
                finalPosition,
                scrolledDistance: finalPosition - initialPosition,
                pageHeight,
                viewportHeight,
                scrollTarget: scrollDistance,
            },
            content: {
                title,
                textBefore,
                textAfter,
                screenshotBefore,
                screenshotAfter,
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
    const toolConfig = tools.scrollAndCapture;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const scrollDistanceParam = toolConfig.parameters.find(p => p.name === 'scrollDistance');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                scrollDistance: z.union([z.string(), z.number()]).optional().describe(scrollDistanceParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, scrollDistance, headless} = args;
            try {
                const result = await scrollAndCapture(url, scrollDistance, headless);

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `Successfully scrolled page: ${url}\n\nTitle: ${result.content.title}\n\nScroll Info:\n- Initial Position: ${result.scrollInfo.initialPosition}px\n- Final Position: ${result.scrollInfo.finalPosition}px\n- Scrolled Distance: ${result.scrollInfo.scrolledDistance}px\n- Page Height: ${result.scrollInfo.pageHeight}px\n- Viewport Height: ${result.scrollInfo.viewportHeight}px\n\nLoad time: ${result.loadTime}ms\n\n=== Text Before Scroll ===\n${result.content.textBefore.substring(0, 1000)}${result.content.textBefore.length > 1000 ? '...(truncated)' : ''}\n\n=== Text After Scroll ===\n${result.content.textAfter.substring(0, 1000)}${result.content.textAfter.length > 1000 ? '...(truncated)' : ''}`,
                    },
                    {
                        type: 'image' as const,
                        data: result.content.screenshotBefore,
                        mimeType: 'image/jpeg',
                    },
                    {
                        type: 'image' as const,
                        data: result.content.screenshotAfter,
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
                            text: `Failed to scroll and capture ${url}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
