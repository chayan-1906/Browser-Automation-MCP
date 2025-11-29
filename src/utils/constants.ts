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
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
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
                techDescription: 'CSS selector for the element to click (e.g., "button.submit", "#login-btn")',
                userFriendlyDescription: 'Which element to click on the page',
                optional: false,
            },
            {
                name: 'waitTime',
                techDescription: 'Time to wait after clicking in milliseconds. Default: 1000 (1 second)',
                userFriendlyDescription: 'How long to wait after clicking before capturing the result',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
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
                techDescription: 'CSS selector for the element to wait for (e.g., ".content-loaded", "#data-table")',
                userFriendlyDescription: 'Which element to wait for on the page',
                optional: false,
            },
            {
                name: 'timeout',
                techDescription: 'Maximum time to wait for the element in milliseconds. Default: 30000 (30 seconds)',
                userFriendlyDescription: 'How long to wait for the element before giving up (in milliseconds)',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
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
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
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
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    pageToPdf: {
        name: 'page-to-pdf',
        category: 'Browser Automation',
        techDescription: 'Generates a PDF of the complete page with automatic lazy-loading support. Scrolls through page to load all images before PDF generation. Can optionally click multiple elements before generating PDF to expand tabs/sections. If no output path provided, saves to OS Downloads folder with auto-generated filename',
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
                techDescription: 'Optional file system path where PDF should be saved (e.g., "C:\\Downloads\\page.pdf"). If not provided, saves to OS Downloads folder with auto-generated filename based on URL (e.g., "example-com.pdf")',
                userFriendlyDescription: 'Where to save the PDF file (optional - defaults to Downloads folder)',
                optional: true,
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
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
                userFriendlyDescription: 'Whether to show the browser window or run it hidden in the background',
                optional: true,
            },
        ],
    },
    getPageHtml: {
        name: 'get-page-html',
        category: 'Browser Automation',
        techDescription: 'Returns HTML content of a page. Can return full HTML, only interactive elements (buttons, links, modals, popups), or a simplified structure. Useful for finding correct CSS selectors for elements',
        userFriendlyDescription: 'Get the HTML code of a webpage to find the correct selectors for buttons, popups, and other elements',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to',
                userFriendlyDescription: 'The website address to get HTML from',
                optional: false,
            },
            {
                name: 'selector',
                techDescription: 'CSS selector to limit HTML extraction to a specific element and its children',
                userFriendlyDescription: 'Only get HTML from a specific part of the page (optional)',
                optional: true,
            },
            {
                name: 'mode',
                techDescription: 'What HTML to return: "full" (complete page), "interactive" (only buttons, links, modals, popups - DEFAULT), or "structure" (simplified tag tree)',
                userFriendlyDescription: 'How much HTML to return - "interactive" is usually best for finding selectors',
                optional: true,
            },
            {
                name: 'maxLength',
                techDescription: 'Maximum characters to return. Default: 50000. Output will be truncated if exceeded',
                userFriendlyDescription: 'Maximum length of HTML to return',
                optional: true,
            },
            {
                name: 'headless',
                techDescription: 'Run browser in headless mode (invisible). Set to false to see browser window. Default: true',
                userFriendlyDescription: 'Whether to show the browser window',
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
    waitForUser: {
        name: 'wait-for-user',
        category: 'Browser Automation',
        techDescription: 'Opens a page in visible browser mode and waits for user to perform manual actions (like logging in). After the wait period or when a target selector appears, captures the page state. Always runs in visible mode.',
        userFriendlyDescription: 'Wait for you to manually interact with a page (like logging in) before capturing its content',
        parameters: [
            {
                name: 'url',
                techDescription: 'The complete URL to navigate to',
                userFriendlyDescription: 'The website address to open',
                optional: false,
            },
            {
                name: 'waitTime',
                techDescription: 'Maximum time to wait for user action in milliseconds. Default: 60000 (60 seconds)',
                userFriendlyDescription: 'How long to wait for you to complete your action (in milliseconds)',
                optional: true,
            },
            {
                name: 'waitForSelector',
                techDescription: 'CSS selector that indicates the action is complete (e.g., ".dashboard" after login). If provided, tool will finish early when this element appears',
                userFriendlyDescription: 'An element on the page that appears after your action is done (optional)',
                optional: true,
            },
            {
                name: 'message',
                techDescription: 'Custom message to display in console while waiting',
                userFriendlyDescription: 'A message to remind you what to do',
                optional: true,
            },
        ],
    },
};

const constants = {
    browserAutomationConfigFile: 'browser_automation_config.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export {tools, constants};
