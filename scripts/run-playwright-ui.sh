#!/bin/bash

# Script to run Playwright UI in Codespaces
# This script detects if running in Codespaces and uses the appropriate configuration

echo "🎭 Starting Playwright UI..."

# Function to check if a port is available
check_port() {
  local port=$1
  if ! nc -z localhost $port &>/dev/null; then
    return 0  # Port is available
  else
    return 1  # Port is in use
  fi
}

# Find an available port starting from 8080
find_available_port() {
  local port=8080
  while ! check_port $port; do
    echo "⚠️ Port $port is already in use"
    port=$((port + 1))
    if [ $port -gt 8100 ]; then
      echo "❌ No available ports found in range 8080-8100"
      exit 1
    fi
  done
  echo $port
}

# Check if running in Codespaces
if [ -n "$CODESPACES" ]; then
  echo "📡 Detected Codespaces environment"
  
  # Check if nc (netcat) is available
  if ! command -v nc &> /dev/null; then
    echo "⚠️ netcat not found, installing..."
    apt-get update -qq && apt-get install -qq -y netcat-openbsd > /dev/null
  fi
  
  PORT=$(find_available_port)
  echo "🌐 UI will be available at: https://$CODESPACE_NAME-$PORT.app.github.dev/"
  npx playwright test --ui-host=0.0.0.0 --ui-port=$PORT
else
  echo "💻 Running in local environment"
  npm run test:e2e:ui
fi