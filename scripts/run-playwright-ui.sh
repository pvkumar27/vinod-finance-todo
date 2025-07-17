#!/bin/bash

# Script to run Playwright UI in Codespaces
# This script detects if running in Codespaces and uses the appropriate configuration

echo "🎭 Starting Playwright UI..."

# Check if running in Codespaces
if [ -n "$CODESPACES" ]; then
  echo "📡 Detected Codespaces environment"
  
  # Try different ports directly
  for PORT in 8090 8091 8092 8093 8094 8095; do
    echo "🔍 Trying port $PORT..."
    echo "🌐 UI will be available at: https://$CODESPACE_NAME-$PORT.app.github.dev/"
    
    # Run playwright with the current port and check if it succeeds
    if npx playwright test --ui-host=0.0.0.0 --ui-port=$PORT; then
      # If we get here, the command succeeded
      exit 0
    fi
    
    echo "⚠️ Port $PORT failed, trying next port..."
    sleep 1
  done
  
  echo "❌ All ports failed. Please try again later or manually specify a port."
  exit 1
else
  echo "💻 Running in local environment"
  npx playwright test --ui
fi