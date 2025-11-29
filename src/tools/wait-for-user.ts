import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Open a page in visible mode and wait for user to perform manual actions
 */
const waitForUser = async (url: string, waitTime: number = 60000, waitForSelector?: string, message?: string) => {
    // Always use visible mode (headless: false) for this tool
    const browser = await browserPool.getBrowser({headless: false});
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

        // Display wait message to user
        const waitTimeInSeconds = Math.round(waitTime / 1000);
        const waitMessage = message || 'Complete your action (e.g., logging in)';
        await printInConsole(transport, `⏳ Waiting for user action... You have ${waitTimeInSeconds} seconds. ${waitMessage}`);

        const startTime = Date.now();
        let selectorFound = false;
        let elapsedTime = 0;

        if (waitForSelector) {
            // Poll for selector every 2 seconds
            await printInConsole(transport, `Watching for selector: ${waitForSelector}`);

            while (elapsedTime < waitTime) {
                try {
                    const element = await page.$(waitForSelector);
                    if (element) {
                        selectorFound = true;
                        await printInConsole(transport, `✓ Selector found: ${waitForSelector}`);
                        break;
                    }
                } catch (error: any) {
                    // Selector not found yet, continue waiting
                    await printInConsole(transport, 'Selector not found yet, continue waiting');
                }

                // Wait 2 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 2000));
                elapsedTime = Date.now() - startTime;

                // Update user on remaining time every 10 seconds
                if (elapsedTime % 10000 < 2000) {
                    const remainingSeconds = Math.round((waitTime - elapsedTime) / 1000);
                    if (remainingSeconds > 0) {
                        await printInConsole(transport, `Still waiting... ${remainingSeconds} seconds remaining`);
                    }
                }
            }

            if (!selectorFound && elapsedTime >= waitTime) {
                await printInConsole(transport, `⏱ Timeout reached. Selector "${waitForSelector}" not found. Capturing current state...`);
            }
        } else {
            // No selector - just wait for the full duration
            await printInConsole(transport, `Waiting for ${waitTimeInSeconds} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            elapsedTime = Date.now() - startTime;
            await printInConsole(transport, `⏱ Wait time completed. Capturing current state...`);
        }

        // Capture page state
        const currentUrl = page.url();
        const currentTitle = await page.title();
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

        await page.close();
        browserPool.releaseBrowser({headless: false});

        return {
            success: true,
            url: currentUrl,
            title: currentTitle,
            text,
            screenshot,
            waitedFor: elapsedTime,
            selectorFound: waitForSelector ? selectorFound : undefined,
        };
    } catch (error: any) {
        await page.close().catch(() => {
        });
        browserPool.releaseBrowser({headless: false});
        throw error;
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.waitForUser;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const waitTimeParam = toolConfig.parameters.find(p => p.name === 'waitTime');
    const waitForSelectorParam = toolConfig.parameters.find(p => p.name === 'waitForSelector');
    const messageParam = toolConfig.parameters.find(p => p.name === 'message');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                waitTime: z.number().optional().describe(waitTimeParam?.techDescription || ''),
                waitForSelector: z.string().optional().describe(waitForSelectorParam?.techDescription || ''),
                message: z.string().optional().describe(messageParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, waitTime, waitForSelector, message} = args;
            try {
                const result = await waitForUser(url, waitTime, waitForSelector, message);

                const statusMessage = result.selectorFound !== undefined
                    ? (result.selectorFound ? '✓ Target selector appeared' : '⏱ Timeout - selector not found')
                    : '⏱ Wait completed';

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `${statusMessage}\n\nURL: ${result.url}\nTitle: ${result.title}\nWaited for: ${Math.round(result.waitedFor / 1000)} seconds\n\nVisible text:\n${result.text.substring(0, 2000)}${result.text.length > 2000 ? '...(truncated)' : ''}`,
                        },
                        {
                            type: 'image' as const,
                            data: result.screenshot,
                            mimeType: 'image/jpeg',
                        },
                    ],
                };
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to wait for user at ${url} ❌: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
