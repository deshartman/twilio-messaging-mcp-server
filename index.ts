#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TwilioMessagingServer } from "./servers/TwilioMessagingServer.js";

// Get configuration parameters from the command line arguments
/****************************************************
 * 
 *                Twilio API Credentials
 *  
 ****************************************************/

// NOTE: we are enforcing use of API Keys here instead of Auth Token, as it is a better posture for message level sends
const accountSid = process.argv[2] || '';
const apiKey = process.argv[3] || '';
const apiSecret = process.argv[4] || '';
const number = process.argv[5] || '';

// Validate required configuration
if (!accountSid || !apiKey || !apiSecret || !number) {
    console.error("Usage: twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>");
    process.exit(1);
}

// Validate Twilio Account SID format
if (!accountSid.startsWith('AC')) {
    console.error(`TwilioMessagingServer: Invalid Account SID format. Twilio Account SID must start with 'AC'`);
    process.exit(1);
}

// Create Twilio service with provided credentials
const twilioMessagingServer = new TwilioMessagingServer(accountSid, apiKey, apiSecret, number);

// Set up the callback handler to log messages and also set the callback Data
twilioMessagingServer.on('log', (data: { level: string, message: string }) => {
    // Forward logs to the MCP server
    // Only use valid log levels: info, error, debug. If level is 'warn', treat it as 'info'
    const mcpLevel = data.level === 'warn' ? 'info' : data.level as "info" | "error" | "debug";

    // Send the log message to the MCP server's underlying Server instance
    mcpServer.server.sendLoggingMessage({
        level: mcpLevel,
        data: data.message,
    });
});

let callbackData: any = null;

// Set up the callback handler to log messages and also set the callback Data
twilioMessagingServer.on('callback', (callbackMessage) => {
    callbackData = JSON.stringify(callbackMessage, null, 2);
});

/****************************************************
 * 
 *                      MCP server
 *  
 ****************************************************/

// Server configuration with clear naming for the messaging service
const SERVER_CONFIG = {
    name: "TwilioMessagingServer",
    description: "MCP server for sending SMS messages via Twilio API",
    version: "1.0.0"
};

const MCP_CAPABILITIES = {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {}  // Add logging capability
    }
}

const mcpServer = new McpServer(SERVER_CONFIG, MCP_CAPABILITIES);


// Define schemas for Twilio messaging
const messageSchema = z.object({
    to: z.string().describe("The Twilio To number in +E.164 format (+XXXXXXXXXX)"),
    message: z.string().describe("The message to send")
});

// Register the SMS sending tool
mcpServer.tool(
    "send-sms",
    "Send an SMS message via Twilio",
    messageSchema.shape,
    async ({ to, message }) => {
        try {
            const response = await twilioMessagingServer.sendSMS(to, message);

            const sid = response?.sid;

            if (sid) {
                return {
                    content: [{
                        type: "text",
                        text: `Message sent successfully. SID: ${sid}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: "Failed to send message. Check logs for details."
                    }],
                    isError: true
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`TwilioMessagingServer: Error sending SMS: ${errorMessage}`);

            return {
                content: [{
                    type: "text",
                    text: `Error sending message: ${errorMessage}`
                }],
                isError: true
            };
        }
    }
);

// Create a resource template for the status callback for the Messaging API to uri: Accounts/{AccountSid}/Messages.json
// resource(name: string, template: ResourceTemplate, metadata: ResourceMetadata, readCallback: ReadResourceTemplateCallback): void;

mcpServer.resource(
    "twilio-status-callback",   // name
    new ResourceTemplate("twilio://Accounts/{AccountSid}/Messages/{callSid}", { list: undefined }), // ResourceTemplate
    { description: "Get the status of a Twilio message" },  /// ResourceMetadata
    async (uri, variables, extra) => {      // ReadResourceTemplateCallback
        const callSid = variables.callSid as string;
        // Get the latest data from Twilio
        // const sessionStatusCallbackData = callbackData;

        if (!callbackData) {
            return {
                contents: [
                    {
                        uri: uri.toString(),
                        text: `No message for Call SID: ${callSid}`,
                        mimeType: "text/plain"
                    }
                ]
            };
        }

        // const jsonContent = JSON.stringify(callbackData, null, 2);

        return {
            contents: [
                {
                    uri: uri.toString(),
                    text: callbackData,
                    mimeType: "text/plain"
                }
            ]
        };
    }
);

mcpServer.resource(
    "twilio-status-callback-raw",   // name
    "twilio://statuscallback", // Resource URI
    { description: "Get the raw status callback data from Twilio" },  // ResourceMetadata
    async (uri) => {
        // Get the latest data from Twilio
        return {
            contents: [
                {
                    uri: uri.toString(),
                    text: callbackData,
                    mimeType: "application/json"
                }
            ]
        };
    }
)

// create a new mcpServer.prompt  to tell the LLM how to use the tool and how to call the resource for status updates
// Register prompts using the built-in prompt method
mcpServer.prompt(
    "SendSMS",
    "Prompt for sending an SMS using Twilio Messaging MCP Server",
    messageSchema.shape,
    (args, extra) => {
        const { to, message } = args;
        return {
            messages: [
                {
                    role: "assistant",
                    content: {
                        type: "text",
                        text: `To send an SMS message to ${to}, use the 'send-sms' tool with the following parameters:\n\n- to: ${to}\n- message: ${message}`
                    }
                }
            ]
        };
    }
);

// Start the server
async function main() {
    try {
        const transport = new StdioServerTransport();
        await mcpServer.connect(transport);
    } catch (error) {
        console.error(`TwilioMessagingServer: Error starting server: ${error}`);
        process.exit(1);
    }
}

// Handle clean shutdown
process.on("SIGINT", async () => {
    await mcpServer.close();
    process.exit(0);
});

// Start the server
main().catch(error => {
    console.error(`TwilioMessagingServer: Fatal error: ${error}`);
    process.exit(1);
});
