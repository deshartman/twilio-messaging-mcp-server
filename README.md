# Twilio Messaging MCP Server

An MCP (Model Context Protocol) server that enables sending SMS messages via the Twilio API.

## Features

- Send SMS messages via Twilio
- Integrates with MCP clients like Claude Desktop
- Secure credential handling without environment variables

## Installation

You can use this server directly via npx:

```bash
npx twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>
```

Or install it globally:

```bash
npm install -g twilio-messaging-mcp-server
twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>
```

## Configuration

The server requires the following parameters:

- `accountSid`: Your Twilio Account SID (must start with 'AC')
- `apiKey`: Your Twilio API Key
- `apiSecret`: Your Twilio API Secret
- `number`: The Twilio phone number to send messages from (in E.164 format, e.g., +1234567890)

## Usage with Claude Desktop

### Local Development

For local development (when the package is not published to npm), add the following to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "twilio-messaging": {
      "command": "node",
      "args": [
        "/PATHTONODE/twilio-messaging-mcp-server/dist/index.js",
        "your_account_sid_here1234567890abcdef",
        "your_api_key_here1234567890abcdef",
        "1234567890abcdef1234567890abcdef",
        "+1234567890"
      ]
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
echo "$(pwd)/dist/index.js"

# On Windows (PowerShell)
Write-Output "$((Get-Location).Path)\dist\index.js"
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
        "your_your_account_sid_here_here",
        "your_api_key_here",
        "your_api_secret_here",
        "+1234567890"
      ]
    }
  }
}
```

## Available Tools

### send-sms

Sends an SMS message via Twilio.

Parameters:
- `to`: Destination phone number in E.164 format (+1XXXXXXXXXX)
- `message`: Message content to send

Example usage in an LLM (Local Language Model):
```
Can you send an SMS to +1234567890 saying "Hello from MCP!"
```

## Development

To build the project:

```bash
npm install
npm run build
```

### Running the Server Manually

To start the server manually for testing (outside of Claude Desktop):

```bash
# Run with actual credentials
node dist/index.js "your_account_sid_here" "your_api_key_here" "your_api_secret" "+1234567890"

# Or use the npm script (which uses ts-node for development)
npm run dev -- "your_account_sid_here" "your_api_key_here" "your_api_secret" "+1234567890"
```

The server will start and wait for MCP client connections. You should see output like:
```
[17/03/2025 18:39:16] [TwilioMessagingServer] Server started successfully
```

When using with Claude Desktop, the server is started automatically when Claude loads the configuration file. You don't need to manually start it.

## License

MIT
