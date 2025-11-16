import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Execute custom JavaScript code in the page context
 */
const executeScript = async (url: string, script: string, headless: boolean = true) => {
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

        await printInConsole(transport, `Executing custom script...`);

        let scriptResult: any;
        let executionError: string | undefined;

        try {
            scriptResult = await page.evaluate((scriptCode: string) => {
                // Execute the script in the page context
                const result = eval(scriptCode);
                return result;
            }, script);
            await printInConsole(transport, `Script executed successfully`);
        } catch (error: any) {
            executionError = error.message;
            await printInConsole(transport, `Script execution error: ${error.message}`);
        }

        // Capture screenshot after script execution
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
            success: !executionError,
            url,
            script,
            result: executionError ? undefined : scriptResult,
            error: executionError,
            content: {
                title,
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
    const toolConfig = tools.executeScript;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const scriptParam = toolConfig.parameters.find(p => p.name === 'script');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                script: z.string().describe(scriptParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, script, headless} = args;
            try {
                const result = await executeScript(url, script, headless);

                // Format the result for display
                let resultText = '';
                if (result.error) {
                    resultText = `Script execution failed: ${result.error}`;
                } else {
                    // Serialize the result
                    let serializedResult: string;
                    try {
                        if (typeof result.result === 'object' && result.result !== null) {
                            serializedResult = JSON.stringify(result.result, null, 2);
                        } else if (result.result === undefined) {
                            serializedResult = 'undefined';
                        } else if (result.result === null) {
                            serializedResult = 'null';
                        } else {
                            serializedResult = String(result.result);
                        }
                    } catch (e) {
                        serializedResult = String(result.result);
                    }

                    resultText = `Script executed successfully!\n\nResult:\n${serializedResult}`;
                }

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `${resultText}\n\nURL: ${result.url}\nTitle: ${result.content.title}\nLoad time: ${result.loadTime}ms\n\nScript executed:\n${result.script}`,
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
                            text: `Failed to execute script on ${url}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
