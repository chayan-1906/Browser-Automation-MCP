import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";

import {registerTool as browsePage} from '../tools/browse-page';
import {registerTool as extractLinks} from '../tools/extract-links';
import {registerTool as clickElement} from '../tools/click-element';
import {registerTool as executeScript} from '../tools/execute-script';
import {registerTool as waitForSelector} from '../tools/wait-for-selector';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    browsePage(server);
    extractLinks(server);
    clickElement(server);
    waitForSelector(server);
    executeScript(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
