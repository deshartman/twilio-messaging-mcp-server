# Twilio Messaging MCP Server

An MCP (Model Context Protocol) server that enables sending SMS messages via the Twilio API.

## Features

- Send SMS messages via Twilio
- Check message status via resource templates
- Status callback server using ngrok for receiving real-time message status updates
- Includes helpful prompts for LLM guidance
- Integrates with MCP clients like Claude Desktop
- Secure credential handling without environment variables
- Uses Twilio API Keys for improved security

## Installation

You can use this server directly via npx:

```bash
# With environment variables for callback functionality
NGROK_AUTH_TOKEN="your_ngrok_auth_token" NGROK_CUSTOM_DOMAIN="your_custom_domain" npx twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>

# Or using -e flag with npx
npx -e NGROK_AUTH_TOKEN="your_ngrok_auth_token" -e NGROK_CUSTOM_DOMAIN="your_custom_domain" twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>
```

Or install it globally:

```bash
npm install -g twilio-messaging-mcp-server

# Run with environment variables
NGROK_AUTH_TOKEN="your_ngrok_auth_token" NGROK_CUSTOM_DOMAIN="your_custom_domain" twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>
```

## Configuration

The server requires the following parameters:

- `accountSid`: Your Twilio Account SID (must start with 'AC', will be validated)
- `apiKey`: Your Twilio API Key (starts with 'SK')
- `apiSecret`: Your Twilio API Secret
- `number`: The Twilio phone number to send messages from (in E.164 format, e.g., +1234567890)

### Environment Variables

For status callback functionality, the following environment variables are required:

- `NGROK_AUTH_TOKEN`: Your ngrok authentication token (required for the callback server)
- `NGROK_CUSTOM_DOMAIN`: (Optional) Your custom ngrok domain if you have one

They need to be passed in the NPX command with "-e" for example.

### Callback Server

This server uses ngrok to create a public URL that Twilio can use to send status callbacks. When you send an SMS message, Twilio will send status updates to this URL as the message status changes (e.g., from "queued" to "sent" to "delivered"). These status updates are captured by the callback server and made available through the `twilio-status-callback` resource.

To use this functionality, you need to provide an ngrok authentication token via the `NGROK_AUTH_TOKEN` environment variable. You can optionally provide a custom domain via the `NGROK_CUSTOM_DOMAIN` environment variable if you have a paid ngrok account with custom domains.

### Security Note

This server uses API Keys and Secrets instead of Auth Tokens for improved security. This approach provides better access control and the ability to revoke credentials if needed. For more information, see the [Twilio API Keys documentation](https://www.twilio.com/docs/usage/requests-to-twilio).

## Usage with Claude Desktop

### Local Development

For local development (when the package is not published to npm), add the following to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "twilio-messaging": {
      "command": "node",
      "args": [
        "/PATHTONODE/twilio-messaging-mcp-server/build/index.js",
        "your_account_sid_here",
        "your_api_key_here",
        "your_api_secret_here",
        "+1234567890"
      ],
      "env": {
        "NGROK_AUTH_TOKEN": "your_ngrok_auth_token_here",
        "NGROK_CUSTOM_DOMAIN": "your_custom_domain_here" // Optional
      }
    }
  }
}
```

Replace the values with your actual Twilio credentials:
- First argument: Your Twilio Account SID (starts with "AC")
- Second argument: Your Twilio API Key (starts with "SK")
- Third argument: Your Twilio API Secret
- Fourth argument: Your Twilio phone number in E.164 format

You can get the absolute path by running the following command in your project directory:

```bash
# On macOS/Linux
echo "$(pwd)/build/index.js"

# On Windows (PowerShell)
Write-Output "$((Get-Location).Path)\build\index.js"
```

### After Publishing to npm

Once the package is published to npm, you can use the following configuration:

```json
{
  "mcpServers": {
    "twilio-messaging": {
      "command": "npx",
      "args": [
        "-y", 
        "twilio-messaging-mcp-server",
        "your_account_sid_here",
        "your_api_key_here",
        "your_api_secret_here",
        "+1234567890"
      ],
      "env": {
        "NGROK_AUTH_TOKEN": "your_ngrok_auth_token_here",
        "NGROK_CUSTOM_DOMAIN": "your_custom_domain_here" // Optional
      }
    }
  }
}
```

## Available Tools

### send-sms

Sends an SMS message via Twilio.

Parameters:
- `to`: Destination phone number in E.164 format (e.g., +1234567890)
- `message`: Message content to send

Example usage in Claude:
```
Can you send an SMS to +1234567890 saying "Hello from MCP!"
```

## Available Resources

### twilio-status-callback

Get the last raw status callback data from Twilio.

URI: `twilio://statuscallback`

This resource provides access to the most recent status callback data received from Twilio after sending a message. The data is in raw JSON format and contains all the information Twilio sends in its status callbacks, including:

- MessageSid: The unique identifier for the message
- MessageStatus: The current status of the message (e.g., "queued", "sent", "delivered", "failed")
- To: The recipient's phone number
- From: Your Twilio phone number
- ErrorCode: If applicable, the error code for failed messages
- ErrorMessage: If applicable, the error message for failed messages

Example usage in Claude:
```
Can you check the status of the SMS message I just sent?
```

Claude will access the `twilio://statuscallback` resource and display the latest status information.

## Available Prompts

### SendSMS

A prompt that guides the LLM on how to use the SMS sending tool. This prompt helps Claude understand how to properly format and send SMS messages using the Twilio API.

Parameters:
- `to`: Destination phone number in E.164 format (e.g., +1234567890)
- `message`: Message content to send

Example usage in Claude:
```
Can you help me send an SMS? I want to send "Meeting at 3pm tomorrow" to +1234567890.
```

Claude will use the SendSMS prompt to understand how to format the request and then use the send-sms tool to send the message.

## Development

### Dependencies

This project uses the following key dependencies:

- **twilio**: The official Twilio SDK for Node.js
- **@modelcontextprotocol/sdk**: The MCP SDK for building MCP servers
- **@deshartman/mcp-status-callback**: A utility package for handling Twilio status callbacks via ngrok

To build the project:

```bash
npm install
npm run build
```

### Running the Server Manually

To start the server manually for testing (outside of Claude Desktop):

```bash
# Run with actual credentials
NGROK_AUTH_TOKEN="your_ngrok_auth_token" NGROK_CUSTOM_DOMAIN="your_custom_domain" node build/index.js "your_account_sid_here" "your_api_key_here" "your_api_secret" "+1234567890"

# Or use the npm script (which uses ts-node for development)
NGROK_AUTH_TOKEN="your_ngrok_auth_token" NGROK_CUSTOM_DOMAIN="your_custom_domain" npm run dev -- "your_account_sid_here" "your_api_key_here" "your_api_secret" "+1234567890"
```

The server will start and wait for MCP client connections via standard input/output (stdio).

When using with Claude Desktop, the server is started automatically when Claude loads the configuration file. You don't need to manually start it.

## License

MIT
