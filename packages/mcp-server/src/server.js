#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createContributionEnvelope, searchTasks, translatePromptToUatp } from "./uatp-tools.js";

const server = new Server(
  {
    name: "uatp-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "translate_prompt",
      description: "Translate a natural-language prompt into a valid UATP task.",
      inputSchema: {
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: { type: "string" },
          format: { enum: ["json", "yaml"], default: "json" },
          translator_provider: { enum: ["deterministic", "local-llm"], default: "deterministic" },
          translator_endpoint: { type: "string" },
          translator_model: { type: "string" }
        }
      }
    },
    {
      name: "search_tasks",
      description: "Search the indexed UATP task library without scanning every YAML file.",
      inputSchema: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 20, default: 5 }
        }
      }
    },
    {
      name: "create_contribution",
      description: "Create an anonymous contribution envelope from a UATP task.",
      inputSchema: {
        type: "object",
        required: ["task"],
        properties: {
          task: { type: "object" },
          format: { enum: ["json", "yaml"], default: "json" }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  if (name === "translate_prompt") {
    return textResult(
      await translatePromptToUatp(args.prompt, args.format ?? "json", {
        provider: args.translator_provider ?? "deterministic",
        endpoint: args.translator_endpoint,
        model: args.translator_model
      })
    );
  }
  if (name === "search_tasks") {
    return textResult(JSON.stringify(searchTasks(args.query, args.limit ?? 5), null, 2));
  }
  if (name === "create_contribution") {
    return textResult(createContributionEnvelope(args.task, args.format ?? "json"));
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);

function textResult(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}
