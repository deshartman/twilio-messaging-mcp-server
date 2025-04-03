#!/bin/bash

# Script to run the Twilio Messaging MCP Server

# Check if all required arguments are provided
if [ $# -lt 4 ]; then
  echo "Usage: $0 <accountSid> <apiKey> <apiSecret> <number> [ngrokDomain]"
  echo "Example: $0 AC123 KEY123 SECRET123 +123456789 myapp.ngrok.dev"
  exit 1
fi

# Set variables from arguments
ACCOUNT_SID=$1
API_KEY=$2
API_SECRET=$3
PHONE_NUMBER=$4
NGROK_DOMAIN=${5:-"your-domain.ngrok.dev"}  # Default to your-domain.ngrok.dev if not provided

# Check if NGROK_AUTH_TOKEN is set in environment
if [ -z "$NGROK_AUTH_TOKEN" ]; then
  echo "NGROK_AUTH_TOKEN environment variable is not set."
  echo "Please set it before running this script:"
  echo "export NGROK_AUTH_TOKEN=your_ngrok_auth_token"
  exit 1
fi

# Run the server with the provided arguments
env NGROK_AUTH_TOKEN=$NGROK_AUTH_TOKEN NGROK_CUSTOM_DOMAIN=$NGROK_DOMAIN node build/index.js $ACCOUNT_SID $API_KEY $API_SECRET $PHONE_NUMBER
