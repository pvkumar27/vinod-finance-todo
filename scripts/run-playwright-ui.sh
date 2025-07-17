#!/bin/bash

# Script to run Playwright UI in Codespaces
# This script detects if running in Codespaces and uses the appropriate configuration

echo "🎭 Starting Playwright UI..."

# Check if running in Codespaces
if [ -n "$CODESPACES" ]; then
  echo "📡 Detected Codespaces environment"
  echo "🌐 UI will be available at: https://$CODESPACE_NAME-8080.app.github.dev/"
  npm run test:e2e:ui:codespaces
else
  echo "💻 Running in local environment"
  npm run test:e2e:ui
fi