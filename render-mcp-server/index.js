#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const RENDER_API_KEY = "rnd_Uh92BWusLV654pvbXozwxnHWLAVx";
const BASE_URL = "https://api.render.com/v1";

class RenderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "render-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      this.handleListTools.bind(this)
    );
    this.server.setRequestHandler(
      CallToolRequestSchema,
      this.handleCallTool.bind(this)
    );
  }

  setupToolHandlers() {
    // Tool handlers will be implemented here
  }

  async handleListTools() {
    return {
      tools: [
        {
          name: "list_services",
          description: "List all Render services",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_service_status",
          description: "Get the status of a specific Render service",
          inputSchema: {
            type: "object",
            properties: {
              service_name: {
                type: "string",
                description: "Name of the service to check",
              },
            },
            required: ["service_name"],
          },
        },
        {
          name: "list_deployments",
          description: "List recent deployments for a service",
          inputSchema: {
            type: "object",
            properties: {
              service_name: {
                type: "string",
                description: "Name of the service",
              },
            },
            required: ["service_name"],
          },
        },
        {
          name: "trigger_deployment",
          description: "Trigger a new deployment for a service",
          inputSchema: {
            type: "object",
            properties: {
              service_name: {
                type: "string",
                description: "Name of the service to deploy",
              },
            },
            required: ["service_name"],
          },
        },
      ],
    };
  }

  async handleCallTool(request) {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "list_services":
          return await this.listServices();
        case "get_service_status":
          return await this.getServiceStatus(args.service_name);
        case "list_deployments":
          return await this.listDeployments(args.service_name);
        case "trigger_deployment":
          return await this.triggerDeployment(args.service_name);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error.message}`
      );
    }
  }

  async makeRenderAPIRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${RENDER_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `Render API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async listServices() {
    const data = await this.makeRenderAPIRequest("/services");
    const services = data.map((item) => item.service);

    return {
      content: [
        {
          type: "text",
          text: `Found ${services.length} services:\n\n${services
            .map(
              (service) =>
                `- **${service.name}** (${service.type}): ${service.status || "Unknown status"}`
            )
            .join("\n")}`,
        },
      ],
    };
  }

  async getServiceStatus(serviceName) {
    const data = await this.makeRenderAPIRequest("/services");
    const service = data.find(
      (item) => item.service.name === serviceName
    )?.service;

    if (!service) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${serviceName}" not found.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `**${service.name}**\n- Type: ${service.type}\n- Status: ${service.status || "Unknown"}\n- Created: ${service.createdAt}\n- Updated: ${service.updatedAt}\n- Suspended: ${service.suspended}`,
        },
      ],
    };
  }

  async listDeployments(serviceName) {
    const data = await this.makeRenderAPIRequest("/services");
    const service = data.find(
      (item) => item.service.name === serviceName
    )?.service;

    if (!service) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${serviceName}" not found.`,
          },
        ],
      };
    }

    const deployments = await this.makeRenderAPIRequest(
      `/services/${service.id}/deploys`
    );
    const recentDeployments = deployments.slice(0, 5); // Last 5 deployments

    return {
      content: [
        {
          type: "text",
          text: `Recent deployments for **${serviceName}**:\n\n${recentDeployments
            .map(
              (item, index) =>
                `${index + 1}. **${item.deploy.commit.message.split("\n")[0]}**\n   Status: ${item.deploy.status}\n   Started: ${item.deploy.startedAt}\n   Commit: ${item.deploy.commit.id.slice(0, 7)}`
            )
            .join("\n\n")}`,
        },
      ],
    };
  }

  async triggerDeployment(serviceName) {
    const data = await this.makeRenderAPIRequest("/services");
    const service = data.find(
      (item) => item.service.name === serviceName
    )?.service;

    if (!service) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${serviceName}" not found.`,
          },
        ],
      };
    }

    // Trigger deployment by making a POST request to redeploy
    const result = await this.makeRenderAPIRequest(
      `/services/${service.id}/deploys`,
      {
        method: "POST",
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Deployment triggered for **${serviceName}**!\n\nDeployment ID: ${result.deploy.id}\nStatus: ${result.deploy.status}\nStarted: ${result.deploy.startedAt}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Render MCP server running...");
  }
}

const server = new RenderMCPServer();
server.run().catch(console.error);
