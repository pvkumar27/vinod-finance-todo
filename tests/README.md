# E2E Testing Suite

## Overview

This directory contains the modernized E2E testing suite for FinTask, built with Playwright. The tests are organized into different suites for various testing scenarios.

## Test Structure

```
tests/
├── e2e/
│   ├── core/                    # Core functionality tests
│   │   ├── authentication.spec.js
│   │   └── navigation.spec.js
│   ├── credit-cards/           # Credit card feature tests
│   │   └── credit-card-crud.spec.js
│   ├── todos/                  # Todo feature tests
│   │   └── todo-crud.spec.js
│   ├── utils/                  # Utility tests
│   │   ├── cleanup.spec.js
│   │   └── responsive.spec.js
│   └── essential.spec.js       # Essential tests for CI/CD
├── config/
│   ├── playwright.config.js    # Playwright configuration
│   └── test-suites.js         # Test suite definitions
├── fixtures/
│   └── test-credentials.js     # Test credentials
├── helpers/
│   ├── console-handler.js      # Console error handling
│   └── test-helpers.js         # Test utility functions
└── README.md                   # This file
```

## Test Suites

### Essential Tests (`npm run test:e2e:essential`)
- **Purpose**: Critical tests for CI/CD pipeline
- **Duration**: ~2-3 minutes
- **Coverage**: Login, basic navigation, core CRUD operations
- **When to use**: Every commit, pull request, deployment

### Core Tests (`npm run test:e2e:core`)
- **Purpose**: Core functionality validation
- **Duration**: ~3-4 minutes
- **Coverage**: Authentication, navigation, basic UI
- **When to use**: Feature development, integration testing

### Full Tests (`npm run test:e2e:full`)
- **Purpose**: Comprehensive test coverage
- **Duration**: ~8-10 minutes
- **Coverage**: All features, responsive design, edge cases
- **When to use**: Release testing, weekly regression

### Smoke Tests (`npm run test:e2e:smoke`)
- **Purpose**: Quick validation after deployment
- **Duration**: ~1-2 minutes
- **Coverage**: Basic functionality only
- **When to use**: Post-deployment verification

## Running Tests

### Local Development
```bash
# Run essential tests (recommended for development)
npm run test:e2e:essential

# Run with browser UI for debugging
npm run test:e2e:headed

# Interactive test runner
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/core/authentication.spec.js

# Run tests with cleanup
npm run test:e2e:cleanup
```

### CI/CD Pipeline
```bash
# Essential tests (used in pipeline)
npm run test:e2e:essential

# Core functionality tests
npm run test:e2e:core

# Full test suite (for comprehensive testing)
npm run test:e2e:full
```

## Test Data Safety

All tests use the `Test_E2E_` prefix for test data to ensure:
- ✅ **SAFE**: No real user data is modified
- ✅ **SAFE**: Automatic cleanup after tests
- ✅ **SAFE**: Multiple validation layers
- ✅ **SAFE**: Pattern detection prevents accidents

## Configuration

### Environment Variables
```bash
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=your-test-password
```

### Viewport Testing
Tests run on multiple viewports:
- **Mobile**: 375x667 (iPhone 12)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1280x800 (Desktop Chrome)

## Features Tested

### Authentication
- ✅ Login flow
- ✅ Session management
- ✅ Logout functionality

### To-Dos
- ✅ Create, edit, delete tasks
- ✅ Task completion toggle
- ✅ Pin/unpin functionality
- ✅ View mode switching (Cards/Table)
- ✅ Due date management

### Credit Cards
- ✅ Create, edit, delete cards
- ✅ View mode switching (Cards/Table)
- ✅ Tab filtering (All/Promo/Inactive)
- ✅ Search functionality

### UI/UX
- ✅ Tab navigation
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

## Debugging Tests

### Screenshots and Videos
- Screenshots: Taken on failure
- Videos: Recorded for all tests
- Reports: HTML report generated in `tests/reports/`

### Console Logs
Tests include console error handling to catch JavaScript errors.

### Test Artifacts
- Test results: `tests/test-results/`
- HTML reports: `tests/reports/`
- Screenshots: `tests/test-results/*/test-failed-*.png`
- Videos: `tests/test-results/*/video.webm`

## Best Practices

1. **Use Essential Tests for CI/CD**: Keep pipeline fast with essential tests
2. **Run Full Tests Weekly**: Comprehensive coverage for regression testing
3. **Clean Test Data**: Always use `Test_E2E_` prefix for test data
4. **Stable Selectors**: Use data-testid or semantic selectors when possible
5. **Wait Strategies**: Use appropriate wait strategies for dynamic content

## Troubleshooting

### Common Issues

1. **Login Failures**
   - Check credentials in environment variables
   - Verify Supabase connection
   - Check network connectivity

2. **Element Not Found**
   - Verify selectors match current UI
   - Check for timing issues
   - Use browser dev tools to inspect elements

3. **Test Timeouts**
   - Increase timeout for slow operations
   - Check for network issues
   - Verify server is running

### Getting Help

1. Check test logs in CI/CD artifacts
2. Run tests locally with `--headed` flag
3. Use `--debug` flag for step-by-step debugging
4. Review HTML reports for detailed failure information

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use the test helpers for common operations
3. Include proper cleanup in `afterEach`
4. Add tests to appropriate suite in `test-suites.js`
5. Update this README if adding new features