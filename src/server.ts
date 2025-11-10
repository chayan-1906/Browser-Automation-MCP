const startTime = Date.now();

import cors from "cors";
import express from "express";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {addOrUpdateMCPServer, freezePortOnQuit, killPortOnLaunch, printInConsole, setEntry} from "mcp-utils/utils";
import {PORT} from "./config/config";
import {setupMcpTools} from "./controllers/ToolsController";

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use(cors());

const server = new McpServer({
    name: 'Browser Automation',
    version: '1.0.0',
});


freezePortOnQuit();

const serverName = 'browser-automation';

async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

killPortOnLaunch(PORT).then(async () => {
    app.listen(PORT, async () => {
        await printInConsole(transport, `Server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);

        const {entry} = setEntry('') as any;
        await addOrUpdateMCPServer(serverName, entry);
        await startMcp();
        await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    });
});
