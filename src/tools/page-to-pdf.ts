import {z} from "zod";
import * as fs from 'fs';
import * as path from 'path';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";
import {generateFilenameFromUrl, getDownloadsFolder} from "../utils/fileUtils";

/**
 * Generate PDF of a page, optionally clicking elements before PDF generation
 */
const pageToPdf = async (url: string, outputPath?: string, clickSelectors?: string[], waitTimeAfterClick: number = 1000, headless: boolean = true) => {
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

        // Click selectors if provided
        if (clickSelectors && clickSelectors.length > 0) {
            await printInConsole(transport, `Clicking ${clickSelectors.length} element(s) before PDF generation...`);

            for (let i = 0; i < clickSelectors.length; i++) {
                const selector = clickSelectors[i];
                try {
                    await printInConsole(transport, `Waiting for element ${i + 1}/${clickSelectors.length}: ${selector}`);
                    await page.waitForSelector(selector, {timeout: 10000, visible: true});

                    await printInConsole(transport, `Clicking element: ${selector}`);
                    await page.click(selector);

                    await printInConsole(transport, `Waiting ${waitTimeAfterClick}ms after click...`);
                    await new Promise(resolve => setTimeout(resolve, waitTimeAfterClick));
                } catch (error: any) {
                    await printInConsole(transport, `Warning: Could not click selector "${selector}": ${error.message}`);
                    // Continue with other selectors even if one fails
                }
            }

            // Wait a bit for any animations to complete
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Scroll through the page to trigger lazy-loaded images
        await printInConsole(transport, `Scrolling through page to load lazy images...`);
        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Scroll through the page in chunks
        let currentPosition = 0;
        while (currentPosition < pageHeight) {
            await page.evaluate((pos) => window.scrollTo(0, pos), currentPosition);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for images to load
            currentPosition += viewportHeight;
        }

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(resolve => setTimeout(resolve, 500));

        await printInConsole(transport, `Finished loading lazy content`);

        // Determine output path
        let finalOutputPath = outputPath;
        if (!finalOutputPath) {
            const downloadsFolder = getDownloadsFolder();
            const filename = generateFilenameFromUrl(url);
            finalOutputPath = path.join(downloadsFolder, filename);
            await printInConsole(transport, `No output path specified, using: ${finalOutputPath}`);
        }

        // Ensure output directory exists
        const outputDir = path.dirname(finalOutputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
            await printInConsole(transport, `Created output directory: ${outputDir}`);
        }

        await printInConsole(transport, `Generating PDF...`);

        // Generate PDF
        await page.pdf({
            path: finalOutputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        const pdfBuffer = fs.readFileSync(finalOutputPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        const fileSize = fs.statSync(finalOutputPath).size;
        const fileSizeKB = (fileSize / 1024).toFixed(2);

        await printInConsole(transport, `PDF generated successfully: ${finalOutputPath} (${fileSizeKB} KB)`);

        const loadTime = Date.now() - startTime;

        await page.close();
        browserPool.releaseBrowser({headless});

        return {
            success: true,
            url,
            title,
            outputPath: finalOutputPath,
            fileSize,
            fileSizeKB,
            pdfBase64,
            clickedSelectors: clickSelectors || [],
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
    const toolConfig = tools.pageToPdf;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const outputPathParam = toolConfig.parameters.find(p => p.name === 'outputPath');
    const clickSelectorsParam = toolConfig.parameters.find(p => p.name === 'clickSelectors');
    const waitTimeAfterClickParam = toolConfig.parameters.find(p => p.name === 'waitTimeAfterClick');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                outputPath: z.string().optional().describe(outputPathParam?.techDescription || 'Optional. If not provided, PDF will be saved to OS Downloads folder with auto-generated filename'),
                clickSelectors: z.array(z.string()).optional().describe(clickSelectorsParam?.techDescription || ''),
                waitTimeAfterClick: z.number().optional().describe(waitTimeAfterClickParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, outputPath, clickSelectors, waitTimeAfterClick, headless} = args;
            try {
                const result = await pageToPdf(url, outputPath, clickSelectors, waitTimeAfterClick, headless);

                const content: any[] = [
                    {
                        type: 'text' as const,
                        text: `Successfully generated PDF from ${url}\n\nTitle: ${result.title}\nOutput Path: ${result.outputPath}\nFile Size: ${result.fileSizeKB} KB\n${result.clickedSelectors.length > 0 ? `\nClicked ${result.clickedSelectors.length} element(s):\n${result.clickedSelectors.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}\n` : ''}\nLoad time: ${result.loadTime}ms\n\nPDF file has been saved to:\n${result.outputPath}`,
                    },
                ];

                return {content};
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to generate PDF from ${url}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
