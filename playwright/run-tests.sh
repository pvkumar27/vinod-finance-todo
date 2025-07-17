#!/bin/bash
# Run all tests with cleanup

# Create directory for test results
mkdir -p test-results

# Run tests
npx playwright test "$@"

# Run cleanup after tests
npx playwright test tests/cleanup.spec.js