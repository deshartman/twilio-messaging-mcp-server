#!/bin/bash

# Script to run the Twilio Messaging MCP Server

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found."
  echo "Please create a .env file based on .env.example with your credentials."
  exit 1
fi

# Load environment variables from .env file safely
# This approach avoids executing commands in the .env file
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ || -z $key ]] && continue
  
  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Export the variable
  export "$key"="$value"
done < .env

# Check if all required variables are set
if [ -z "$ACCOUNT_SID" ] || [ -z "$API_KEY" ] || [ -z "$API_SECRET" ] || [ -z "$TWILIO_NUMBER" ]; then
  echo "Error: Missing required environment variables in .env file."
  echo "Please ensure the following variables are set:"
  echo "  - ACCOUNT_SID"
  echo "  - API_KEY"
  echo "  - API_SECRET"
  echo "  - TWILIO_NUMBER"
  exit 1
fi

# Check if NGROK_AUTH_TOKEN is set
if [ -z "$NGROK_AUTH_TOKEN" ]; then
  echo "Error: NGROK_AUTH_TOKEN environment variable is not set in .env file."
  exit 1
fi

# Set default NGROK_CUSTOM_DOMAIN if not provided
NGROK_CUSTOM_DOMAIN=${NGROK_CUSTOM_DOMAIN:-"your-domain.ngrok.dev"}

# Run the server with the environment variables
env NGROK_AUTH_TOKEN=$NGROK_AUTH_TOKEN NGROK_CUSTOM_DOMAIN=$NGROK_CUSTOM_DOMAIN node build/index.js $ACCOUNT_SID $API_KEY $API_SECRET $TWILIO_NUMBER
