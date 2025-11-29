import {z} from "zod";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {constants, tools} from "../utils/constants";
import {browserPool} from "../services/BrowserPool";

/**
 * Helper function to generate unique CSS selector for an element
 */
const getUniqueSelector = `
function getUniqueSelector(element) {
    if (element.id) {
        return '#' + element.id;
    }

    const path = [];
    let current = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
            selector = '#' + current.id;
            path.unshift(selector);
            break;
        }

        if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\\s+/).filter(c => c);
            if (classes.length > 0) {
                selector += '.' + classes.slice(0, 2).join('.');
            }
        }

        // Add nth-child if needed for uniqueness
        const parent = current.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                c => c.tagName === current.tagName
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += ':nth-child(' + index + ')';
            }
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(' > ');
}
`;

/**
 * Navigate to URL and extract HTML content
 */
const getPageHtml = async (url: string, selector?: string, mode: 'full' | 'interactive' | 'structure' = 'interactive', maxLength: number = 50000, headless: boolean = true, timeout: number = 30000) => {
    const browser = await browserPool.getBrowser({headless});
    const page = await browserPool.createPage(browser);

    try {
        await page.setUserAgent(constants.userAgent);
        await page.setViewport({width: 1920, height: 1080});

        await printInConsole(transport, `Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: timeout,
        });

        const title = await page.title();
        const currentUrl = page.url();
        await printInConsole(transport, `Page loaded: ${title}`);

        let htmlContent: string;

        if (mode === 'full') {
            await printInConsole(transport, `Extracting full HTML${selector ? ` from selector: ${selector}` : ''}...`);
            htmlContent = await page.evaluate((sel) => {
                if (sel) {
                    const element = document.querySelector(sel);
                    return element ? element.outerHTML : 'Selector not found';
                }
                return document.documentElement.outerHTML;
            }, selector);
        } else if (mode === 'interactive') {
            await printInConsole(transport, `Extracting interactive elements${selector ? ` from selector: ${selector}` : ''}...`);
            htmlContent = await page.evaluate((sel, selectorHelper) => {

                eval(selectorHelper);

                const selectors = [
                    'button', 'a', 'input', 'select', 'textarea',
                    '[onclick]', '[role="button"]', '[role="link"]',
                    '[data-action]', '[aria-label]',
                    '.modal', '.popup', '.dialog', '.overlay',
                    '[class*="close"]', '[class*="dismiss"]',
                    '[aria-modal="true"]', '[role="dialog"]'
                ];

                let containerEl: Document | Element = document;
                if (sel) {
                    const element = document.querySelector(sel);
                    if (!element) {
                        return 'Selector not found';
                    }
                    containerEl = element;
                }

                const elements = containerEl.querySelectorAll(selectors.join(','));

                const result: any[] = [];
                elements.forEach((el, index) => {
                    // @ts-ignore - function from eval
                    const uniqueSelector = getUniqueSelector(el);
                    const attributes: any = {};

                    // Collect important attributes
                    ['id', 'class', 'type', 'href', 'aria-label', 'role', 'data-action', 'onclick', 'placeholder', 'name', 'value'].forEach(attr => {
                        const value = el.getAttribute(attr);
                        if (value) {
                            attributes[attr] = value;
                        }
                    });

                    const text = el.textContent ? el.textContent.trim().substring(0, 100) : '';

                    result.push({
                        index: index + 1,
                        tag: el.tagName.toLowerCase(),
                        selector: uniqueSelector,
                        attributes: attributes,
                        text: text,
                        outerHTML: el.outerHTML.substring(0, 500) // Limit to prevent huge output
                    });
                });

                return JSON.stringify(result, null, 2);
            }, selector, getUniqueSelector);
        } else {
            await printInConsole(transport, `Extracting page structure${selector ? ` from selector: ${selector}` : ''}...`);
            htmlContent = await page.evaluate((sel) => {
                function buildTree(element: any, depth = 0): string {
                    if (depth > 10) return ''; // Limit depth to prevent huge output

                    const indent = '  '.repeat(depth);
                    let result = indent + '<' + element.tagName.toLowerCase();

                    if (element.id) {
                        result += '#' + element.id;
                    }

                    if (element.className && typeof element.className === 'string') {
                        const classes = element.className.trim().split(/\s+/).filter((c: string) => c).slice(0, 3);
                        if (classes.length > 0) {
                            result += '.' + classes.join('.');
                        }
                    }

                    // Add important attributes
                    ['type', 'href', 'role', 'aria-label', 'data-action'].forEach(attr => {
                        const value = element.getAttribute(attr);
                        if (value) {
                            result += ` ${attr}="${value.substring(0, 30)}"`;
                        }
                    });

                    result += '>\n';

                    // Process children
                    const children = Array.from(element.children);
                    if (children.length > 0 && depth < 10) {
                        children.slice(0, 20).forEach(child => { // Limit children
                            result += buildTree(child, depth + 1);
                        });
                        if (children.length > 20) {
                            result += indent + '  ... (' + (children.length - 20) + ' more children)\n';
                        }
                    }

                    return result;
                }

                let rootElement: any = document.body;
                if (sel) {
                    const element = document.querySelector(sel);
                    if (!element) {
                        return 'Selector not found';
                    }
                    rootElement = element;
                }

                return buildTree(rootElement);
            }, selector);
        }

        // Truncate if exceeds maxLength
        let truncated = false;
        if (htmlContent.length > maxLength) {
            htmlContent = htmlContent.substring(0, maxLength);
            truncated = true;
            await printInConsole(transport, `HTML content truncated to ${maxLength} characters`);
        }

        await page.close();
        browserPool.releaseBrowser({headless});

        return {
            success: true,
            url: currentUrl,
            title,
            html: htmlContent,
            characterCount: htmlContent.length,
            truncated,
            mode,
        };
    } catch (error: any) {
        await page.close().catch(() => {
        });
        browserPool.releaseBrowser({headless});
        throw error;
    }
}

export const registerTool = (server: McpServer) => {
    const toolConfig = tools.getPageHtml;

    const urlParam = toolConfig.parameters.find(p => p.name === 'url');
    const selectorParam = toolConfig.parameters.find(p => p.name === 'selector');
    const modeParam = toolConfig.parameters.find(p => p.name === 'mode');
    const maxLengthParam = toolConfig.parameters.find(p => p.name === 'maxLength');
    const headlessParam = toolConfig.parameters.find(p => p.name === 'headless');
    const timeoutParam = toolConfig.parameters.find(p => p.name === 'timeout');

    server.registerTool(
        toolConfig.name,
        {
            description: toolConfig.techDescription,
            inputSchema: {
                url: z.string().describe(urlParam?.techDescription || ''),
                selector: z.string().optional().describe(selectorParam?.techDescription || ''),
                mode: z.enum(['full', 'interactive', 'structure']).optional().describe(modeParam?.techDescription || ''),
                maxLength: z.number().optional().describe(maxLengthParam?.techDescription || ''),
                headless: z.boolean().optional().describe(headlessParam?.techDescription || ''),
                timeout: z.number().optional().describe(timeoutParam?.techDescription || ''),
            } as any,
        },
        async (args: any) => {
            const {url, selector, mode, maxLength, headless, timeout} = args;
            try {
                const result = await getPageHtml(url, selector, mode, maxLength, headless);

                let summaryText = `Successfully extracted HTML from ${result.url}\n\nTitle: ${result.title}\nMode: ${result.mode}\nCharacter count: ${result.characterCount}${result.truncated ? ' (truncated)' : ''}\n\n`;

                if (result.mode === 'interactive') {
                    summaryText += `Interactive elements found:\n${result.html}`;
                } else {
                    summaryText += `HTML content:\n${result.html}`;
                }

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: summaryText,
                        },
                    ],
                };
            } catch (error: any) {
                await printInConsole(transport, `Error in ${toolConfig.name}: ${error.message}`);
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Failed to get HTML from ${url} ❌: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}
