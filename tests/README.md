# E2E Testing for FinTask

This directory contains end-to-end tests for the FinTask app using Playwright.

## 📁 Directory Structure

```
tests/
├── e2e/                  # Test specs organized by feature
│   ├── auth/             # Authentication tests
│   ├── credit-cards/     # Credit card tests
│   ├── finances/         # Finance tests
│   ├── todos/            # To-do tests
│   └── utils/            # Utility tests (responsive, navigation, cleanup)
├── fixtures/             # Test data and credentials
├── helpers/              # Helper functions
├── config/               # Test configuration
├── reports/              # Test reports (generated)
└── test-data/            # Test data files (if needed)
```

## 🔒 Test Data Safety

All tests follow these safety principles:

1. **Test Data Identification**: All test data is prefixed with `Test_E2E_` to ensure we never modify real user data.
2. **Cleanup**: Tests automatically clean up after themselves.
3. **Production Safety**: Tests run against production but only affect test data.
4. **Dedicated Test Account**: Tests use a dedicated test account, never a real user account.

## 🚀 Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/finances/my-finances.spec.js

# Run tests with cleanup
./tests/run-tests.sh

# Run UI test runner in Codespaces
./tests/run-ui.sh

# Run only cleanup
npx playwright test tests/e2e/utils/cleanup.spec.js
```

## 📊 Test Coverage

- ✅ **Authentication**: Login flow
- ✅ **My Finances**: Form fields, dropdowns, persistence
- ✅ **Credit Cards**: CRUD operations, Plaid integration
- ✅ **To-Dos**: CRUD operations
- ✅ **Responsive Design**: Mobile, tablet, desktop viewports
- ✅ **Navigation**: Tab switching, interactive elements