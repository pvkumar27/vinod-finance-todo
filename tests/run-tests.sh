#!/bin/bash
# Run all tests with cleanup

# Create directory for test results
mkdir -p tests/reports

# Run tests
npx playwright test "$@"

# Run cleanup after tests
npx playwright test tests/e2e/utils/cleanup.spec.js