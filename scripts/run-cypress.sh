#!/bin/bash

# Enhanced Cypress test runner script for FinTask
# Supports different environments and test modes

set -e

# Default values
ENVIRONMENT="local"
BROWSER="chrome"
HEADED=false
SPEC=""
CLEANUP_ONLY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --browser)
      BROWSER="$2"
      shift 2
      ;;
    --headed)
      HEADED=true
      shift
      ;;
    --spec)
      SPEC="$2"
      shift 2
      ;;
    --cleanup-only)
      CLEANUP_ONLY=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --env <local|staging|prod>  Environment to test against"
      echo "  --browser <chrome|firefox>  Browser to use"
      echo "  --headed                    Run in headed mode"
      echo "  --spec <pattern>            Run specific test spec"
      echo "  --cleanup-only              Run only cleanup tests"
      echo "  --help                      Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Set base URL based on environment
case $ENVIRONMENT in
  local)
    BASE_URL="http://localhost:3000"
    ;;
  staging)
    BASE_URL="https://staging-fintask.netlify.app"
    ;;
  prod)
    BASE_URL="https://fintask.netlify.app"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "🚀 Running Cypress tests"
echo "Environment: $ENVIRONMENT"
echo "Base URL: $BASE_URL"
echo "Browser: $BROWSER"
echo "Headed: $HEADED"

# Set environment variables
export CYPRESS_BASE_URL="$BASE_URL"

# Build Cypress command
CYPRESS_CMD="npx cypress run --browser $BROWSER"

if [ "$HEADED" = true ]; then
  CYPRESS_CMD="$CYPRESS_CMD --headed"
fi

if [ -n "$SPEC" ]; then
  CYPRESS_CMD="$CYPRESS_CMD --spec $SPEC"
fi

if [ "$CLEANUP_ONLY" = true ]; then
  CYPRESS_CMD="$CYPRESS_CMD --spec 'cypress/e2e/utils/cleanup.cy.js'"
fi

# Run tests
echo "Running: $CYPRESS_CMD"
$CYPRESS_CMD

echo "✅ Tests completed"