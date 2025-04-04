# Twilio Messaging MCP Server
[![smithery badge](https://smithery.ai/badge/@deshartman/twilio-messaging-mcp-server)](https://smithery.ai/server/@deshartman/twilio-messaging-mcp-server)

An MCP server for sending SMS messages via Twilio API. This server provides tools, resources, and prompts for interacting with the Twilio Messaging API.

## Features

- Send SMS messages via Twilio
- Get status callbacks from Twilio with enhanced handling via `@deshartman/mcp-status-callback`
- Integrates with Claude AI via the Model Context Protocol (MCP)

## Prerequisites

- Node.js >= 18.0.0
- Twilio account with:
  - Account SID
  - API Key and Secret
  - Twilio phone number
- ngrok account with:
  - Auth token
  - Custom domain (optional)

## Installation

### Installing via Smithery

To install the Twilio Messaging MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@deshartman/twilio-messaging-mcp-server):

```bash
npx -y @smithery/cli install @deshartman/twilio-messaging-mcp-server --client claude
```

### Manual Installation
```bash
npm install @deshartman/twilio-messaging-mcp-server
```

Or run directly with npx:

```bash
npx @deshartman/twilio-messaging-mcp-server <accountSid> <apiKey> <apiSecret> <number>
```

## Environment Variables

- `NGROK_AUTH_TOKEN`: Your ngrok authentication token (required for callback handling)
- `NGROK_CUSTOM_DOMAIN`: Your custom ngrok domain (optional)

## Usage

### Running the Server

You can run the server using the provided script:

```bash
# Set your ngrok auth token
export NGROK_AUTH_TOKEN=your_ngrok_auth_token

# Run the server
./run-server.sh <accountSid> <apiKey> <apiSecret> <number> [ngrokDomain]
```

Example:

```bash
./run-server.sh YOUR_ACCOUNT_SID YOUR_API_KEY YOUR_API_SECRET YOUR_TWILIO_PHONE_NUMBER your-domain.ngrok.dev
```

### Directly with Node.js

```bash
env NGROK_AUTH_TOKEN=your_ngrok_auth_token NGROK_CUSTOM_DOMAIN=your_domain.ngrok.dev node build/index.js <accountSid> <apiKey> <apiSecret> <number>
```

## MCP Integration

This server provides the following MCP capabilities:

### Tools

- `send-sms`: Send an SMS message via Twilio with server readiness validation

### Resources

- `twilio://statuscallback`: Get the last raw status callback data from Twilio with enhanced error handling

### Prompts

- `SendSMS`: Prompt for sending an SMS using Twilio Messaging MCP Server

## Troubleshooting

### ngrok Tunnel Issues

If you encounter an error like:

```
failed to start tunnel: The endpoint 'https://your-domain.ngrok.dev' is already online.
```

You have a few options:

1. Stop your existing endpoint first
2. Use a different domain name
3. Start both endpoints with `--pooling-enabled` to load balance between them

### ENOTEMPTY Error

If you encounter an npm error like:

```
npm ERR! code ENOTEMPTY
npm ERR! syscall rename
```

Try running the server directly with Node.js instead of using npx.

## License

MIT
