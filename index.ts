#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TwilioMessagingServer } from "./servers/TwilioMessagingServer.js";
import { logOut, logError } from "./utils/logger.js";

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
    logError("TwilioMessagingServer", "Missing required configuration parameters");
    console.error("Usage: twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>");
    process.exit(1);
}

// Validate Twilio Account SID format
if (!accountSid.startsWith('AC')) {
    logError("TwilioMessagingServer", "Invalid Account SID format. Twilio Account SID must start with 'AC'");
    console.error("Error: Account SID must start with 'AC'");
    process.exit(1);
}

// Create Twilio service with provided credentials
const twilioMessagingServer = new TwilioMessagingServer(
    accountSid,
    apiKey,
    apiSecret,
    number
);


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

const mcpServer = new McpServer(SERVER_CONFIG);

// Register the SMS sending tool
mcpServer.tool(
    "send-sms",
    "Send an SMS message via Twilio",
    {
        to: z.string().describe("Destination phone number in +E.164 format (+XXXXXXXXXX)"),
        message: z.string().describe("Message content to send")
    },
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
            logError("TwilioMessagingServer", `Error sending SMS: ${errorMessage}`);

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

// Start the server
async function main() {
    try {
        const transport = new StdioServerTransport();
        await mcpServer.connect(transport);
        logOut("TwilioMessagingServer", "Server started successfully");
    } catch (error) {
        logError("TwilioMessagingServer", `Error starting server: ${error}`);
        process.exit(1);
    }
}

// Handle clean shutdown
process.on("SIGINT", async () => {
    logOut("TwilioMessagingServer", "Shutting down...");
    await mcpServer.close();
    process.exit(0);
});

// Start the server
main().catch(error => {
    logError("TwilioMessagingServer", `Fatal error: ${error}`);
    process.exit(1);
});
