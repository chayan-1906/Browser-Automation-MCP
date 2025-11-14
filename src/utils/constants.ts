import {ToolsMap} from "mcp-utils/types";

const tools: ToolsMap = {
    // Browser Automation Tools
    browsePage: {
        name: 'browse-page',
        category: 'Browser Automation',
        techDescription: 'Navigates to a URL and extracts page content including screenshot, visible text, and page title. Uses persistent Chromium profile to maintain login sessions across runs',
        userFriendlyDescription: 'Open a website and get its content, including a screenshot and all visible text',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
            {
                name: 'timeout',
                techDescription: 'Maximum time to wait for page load in milliseconds. Default: 30000 (30 seconds)',
                userFriendlyDescription: 'How long to wait for the page to load before giving up (in milliseconds)',
                optional: true,
            },
        ],
    },
    extractLinks: {
        name: 'extract-links',
        category: 'Browser Automation',
        techDescription: 'Extracts all links from a page or specific elements matching a CSS selector. Returns array of link objects with text, href, and selector information',
        userFriendlyDescription: 'Get all links from a webpage or from specific sections of the page',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address to get links from',
                optional: false,
            },
            {
                name: 'selector',
                techDescription: 'CSS selector to filter links (e.g., "nav a", ".menu a"). If omitted, extracts all links from the page',
                userFriendlyDescription: 'Specific area of the page to get links from (optional, gets all links if not specified)',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    clickElement: {
        name: 'click-element',
        category: 'Browser Automation',
        techDescription: 'Clicks an element specified by CSS selector and captures the resulting page state. Useful for interacting with tabs, buttons, dropdowns, and other clickable elements',
        userFriendlyDescription: 'Click a button, link, or other element on a webpage and see what happens',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'selector',
                techDescription: 'CSS selector to filter links (e.g., "nav a", ".menu a"). If omitted, extracts all links from the page',
                userFriendlyDescription: 'Specific area of the page to get links from (optional, gets all links if not specified)',
                optional: false,
            },
            {
                name: 'waitTime',
                techDescription: 'Time to wait after clicking in milliseconds. Default: 1000 (1 second)',
                userFriendlyDescription: 'How long to wait after clicking before capturing the result',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    waitForSelector: {
        name: 'wait-for-selector',
        category: 'Browser Automation',
        techDescription: 'Waits for an element matching the CSS selector to appear in the DOM. Returns success status and screenshot when element is found or timeout occurs',
        userFriendlyDescription: 'Wait for a specific element to appear on the page before proceeding',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'selector',
                techDescription: 'CSS selector to filter links (e.g., "nav a", ".menu a"). If omitted, extracts all links from the page',
                userFriendlyDescription: 'Specific area of the page to get links from (optional, gets all links if not specified)',
                optional: false,
            },
            {
                name: 'timeout',
                techDescription: 'Maximum time to wait for the element in milliseconds. Default: 30000 (30 seconds)',
                userFriendlyDescription: 'How long to wait for the page to load before giving up (in milliseconds)',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    executeScript: {
        name: 'execute-script',
        category: 'Browser Automation',
        techDescription: 'Executes custom JavaScript code in the page context and returns the result. Useful for complex data extraction or custom interactions not covered by other tools',
        userFriendlyDescription: 'Run custom JavaScript code on a webpage and get the result',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'script',
                techDescription: 'JavaScript code to execute in the page context. Can access DOM and return values',
                userFriendlyDescription: 'The JavaScript code you want to run on the page',
                optional: false,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    scrollAndCapture: {
        name: 'scroll-and-capture',
        category: 'Browser Automation',
        techDescription: 'Scrolls the page by specified distance or to bottom and captures newly visible content. Useful for lazy-loaded content that appears on scroll',
        userFriendlyDescription: 'Scroll down a webpage and capture content that appears as you scroll',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'scrollDistance',
                techDescription: 'Distance to scroll: "bottom" to scroll to page bottom, or number of pixels (e.g., 1000). Default: "bottom"',
                userFriendlyDescription: 'How far to scroll - "bottom" or number of pixels',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    pageToPdf: {
        name: 'page-to-pdf',
        category: 'Browser Automation',
        techDescription: 'Generates a PDF of the complete page. Can optionally click multiple elements before generating PDF to expand tabs/sections. Returns PDF file path and base64 encoded content',
        userFriendlyDescription: 'Save a webpage as a PDF file, optionally expanding sections or tabs first',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to (e.g., https://example.com)',
                userFriendlyDescription: 'The website address you want to visit',
                optional: false,
            },
            {
                name: 'outputPath',
                techDescription: 'File system path where PDF should be saved (e.g., "C:\\Downloads\\page.pdf")',
                userFriendlyDescription: 'Where to save the PDF file on your computer',
                optional: false,
            },
            {
                name: 'clickSelectors',
                techDescription: 'Array of CSS selectors to click before generating PDF. Useful for expanding all tabs/sections. Example: ["button[data-tab=\'code\']", ".expand-all"]',
                userFriendlyDescription: 'List of elements to click before creating the PDF (optional)',
                optional: true,
            },
            {
                name: 'waitTimeAfterClick',
                techDescription: 'Time to wait after each click in milliseconds. Default: 1000 (1 second)',
                userFriendlyDescription: 'How long to wait after each click before proceeding',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'Browser launch mode: "headless" (new browser instance) or "profile" (launch with Chrome profile). Default: "headless"',
                userFriendlyDescription: 'How to open the browser - in the background or use your Chrome profile',
                optional: true,
            },
            {
                name: 'profilePath',
                techDescription: 'Chrome profile directory path. Required when mode="profile". Example: "C:\\Users\\Name\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1"',
                userFriendlyDescription: 'Path to your Chrome profile folder (needed if using your Chrome profile)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (no UI). Only applies when mode="headless". Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
};

const constants = {
    browserAutomationConfigFile: 'browser_automation_config.json',
};

export {tools, constants};
