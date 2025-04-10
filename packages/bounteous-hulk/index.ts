#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';
import { githubTools, handleGitHubRequest } from './src/versioncontrol/github/githubIndex.js';

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof global.fetch;
}

const VERSION_CONTROL = process.env.VERSION_CONTROL; // || 'github';

const server = new Server(
  {
    name: "bounteous-mcp-server",
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  if (VERSION_CONTROL === 'github') {
    return {
      tools: githubTools,
    };
  }
  
  throw new Error(`Unsupported version control system: ${VERSION_CONTROL}`);
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!request.params.arguments) {
    throw new Error("Arguments are required");
  }

  if (VERSION_CONTROL === 'github') {
    return await handleGitHubRequest(request.params.name, request.params.arguments);
  }

  throw new Error(`Unsupported version control system: ${VERSION_CONTROL}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Bounteous MCP Server running on stdio (Version Control: ${VERSION_CONTROL})`);
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});