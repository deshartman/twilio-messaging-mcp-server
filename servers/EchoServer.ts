import { McpServer, ResourceTemplate, ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * EchoServer Configuration
 * -----------------------
 * Simple server that echoes back inputs through various mechanisms
 */
const SERVER_CONFIG = {
    name: "EchoServer",
    description: "A simple server that echoes back the input",
    version: "1.0.0"
};

/**
 * Handler Functions
 * ----------------
 * Separate handler implementations for better readability
 */

// Resource handler function
const handleEchoResource: ReadResourceTemplateCallback = async (UriTemplate, variables) => ({
    contents: [{
        uri: UriTemplate.href,
        text: `Resource echo: ${variables.message}`
    }]
});

// Prompt handler function
const handleEchoPrompt = (args: { message: string }) => ({
    messages: [{
        role: "user" as const,
        content: {
            type: "text" as const,
            text: `Please process this message: ${args.message}`
        }
    }]
});

// Tool handler function
const handleEchoTool = async (args: { message: string }) => ({
    content: [{
        type: "text" as const,
        text: `Tool echo: ${args.message}`
    }]
});


/**
 * Server Initialization and Configuration
 * --------------------------------------
 */
const server = new McpServer(SERVER_CONFIG);

// Register resource handler. Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.
server.resource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    handleEchoResource
);

// Register prompt handler. Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.
server.prompt(
    "echo",
    { message: z.string() },
    handleEchoPrompt
);

// Register tool handler. Tools are a powerful primitive in the Model Context Protocol (MCP) that enable servers to expose executable functionality to clients. Through tools, LLMs can interact with external systems, perform computations, and take actions in the real world.
server.tool(
    "echo",
    { message: z.string() },
    handleEchoTool
);

/**
 * Server Runtime
 * -------------
 * Startup and shutdown handling
 */
async function runServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.info("EchoServer started successfully");
    } catch (error) {
        console.error("Error starting EchoServer:", error);
    }
}

// Handle clean shutdown
process.stdin.on("close", () => {
    console.info("EchoServer closed");
    server.close();
});

// Start the server
runServer().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
