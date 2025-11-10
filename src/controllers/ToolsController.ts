import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";

// import {registerTool as myGitHubAccount} from '../tools/profile/my-github-account';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    // myGitHubAccount(server);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
