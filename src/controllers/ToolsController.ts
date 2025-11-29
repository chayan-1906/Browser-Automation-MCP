import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";

import {registerTool as pageToPdf} from '../tools/page-to-pdf';
import {registerTool as browsePage} from '../tools/browse-page';
import {registerTool as extractLinks} from '../tools/extract-links';
import {registerTool as clickElement} from '../tools/click-element';
import {registerTool as executeScript} from '../tools/execute-script';
import {registerTool as waitForSelector} from '../tools/wait-for-selector';
import {registerTool as scrollAndCapture} from '../tools/scroll-and-capture';
import {registerTool as getPageHtml} from '../tools/get-page-html';
import {registerTool as waitForUser} from '../tools/wait-for-user';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    browsePage(server);
    extractLinks(server);
    clickElement(server);
    waitForSelector(server);
    executeScript(server);
    scrollAndCapture(server);
    pageToPdf(server);
    getPageHtml(server);
    waitForUser(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
