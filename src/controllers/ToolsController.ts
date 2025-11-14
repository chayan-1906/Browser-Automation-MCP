import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";

import {registerTool as browsePage} from '../tools/browse-page';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    browsePage(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
