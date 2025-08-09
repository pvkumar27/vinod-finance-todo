# 🧪 Cypress E2E Testing Guide

## Overview

FinTask uses Cypress for end-to-end testing with robust data-cy selectors and custom commands for reliable, maintainable tests.

## Quick Start

```bash
# Interactive test runner (recommended for development)
npm run cypress:open

# Run all tests headless (CI/CD)
npm run test:e2e

# Run essential tests only
npm run test:e2e:essential
```

## Test Structure

```
cypress/
├── e2e/
│   ├── essential.cy.js      # Core functionality tests
│   ├── authentication.cy.js # Login/session tests
│   └── navigation.cy.js     # Tab navigation tests
├── fixtures/                # Test data files
└── support/
    ├── commands.js          # Custom commands
    └── e2e.js              # Configuration
```

## Custom Commands

### Authentication
```javascript
// Login with default test user
cy.login()

// Login with specific credentials
cy.login('user@example.com', 'password')
```

### Test Data
```javascript
// Generate test data
cy.generateTestData('todo').then(data => {
  // data.title, data.description, data.dueDate
})

cy.generateTestData('creditCard').then(data => {
  // data.bankName, data.lastFour
})
```

### Cleanup
```javascript
// Clean up test data after tests
cy.cleanupTestData()
```

## Data-Cy Selectors

All tests use semantic `data-cy` attributes for reliability:

### Navigation
```javascript
cy.get('[data-cy="nav-todos-tab"]')     // To-Dos tab
cy.get('[data-cy="nav-cards-tab"]')     // Credit Cards tab
```

### To-Dos
```javascript
cy.get('[data-cy="todo-manager-heading"]')  // Page heading
cy.get('[data-cy="task-input-field"]')      // Task input
cy.get('[data-cy="task-add-button"]')       // Add task button
cy.get('[data-cy="task-update-button"]')    // Update task button
cy.get('[data-cy="view-cards-button"]')     // Cards view
cy.get('[data-cy="view-table-button"]')     // Table view
cy.get('[data-cy="task-container"]')        // Task container
```

### Credit Cards
```javascript
cy.get('[data-cy="credit-cards-heading"]') // Page heading
cy.get('[data-cy="card-add-button"]')       // Add card button
cy.get('[data-cy="card-search-input"]')     // Search input
cy.get('[data-cy="card-grid"]')             // Card grid view
```

## Environment Variables

Set these in your environment or `.env` file:

```bash
CYPRESS_TEST_USER_EMAIL=your-test-email@example.com
CYPRESS_TEST_USER_PASSWORD=your-test-password
```

## Writing Tests

### Basic Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.login()
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should perform specific action', () => {
    // Test implementation
  })
})
```

### Example Test
```javascript
it('should create a new todo', () => {
  cy.generateTestData('todo').then(testData => {
    // Create todo
    cy.get('[data-cy="task-input-field"]').type(testData.title)
    cy.get('[data-cy="task-add-button"]').click()

    // Verify todo appears
    cy.contains(testData.title).should('be.visible')
  })
})
```

## Best Practices

### 1. Use Data-Cy Selectors
✅ **Good**: `cy.get('[data-cy="task-add-button"]')`
❌ **Bad**: `cy.get('button:contains("Add Task")')`

### 2. Generate Unique Test Data
```javascript
cy.generateTestData('todo').then(testData => {
  // Use testData.title (includes unique ID)
})
```

### 3. Clean Up After Tests
```javascript
afterEach(() => {
  cy.cleanupTestData()
})
```

### 4. Use Custom Commands
```javascript
// Instead of repeating login steps
cy.login()
```

## Configuration

### cypress.config.js
```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true
  }
})
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

```yaml
- name: Run Cypress E2E tests
  run: npm run test:e2e:essential
  env:
    CYPRESS_baseUrl: "http://localhost:3000"
    CYPRESS_TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    CYPRESS_TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Debugging

### Interactive Mode
```bash
npm run cypress:open
```

### Headless with Browser
```bash
npm run test:e2e:headed
```

### Screenshots and Videos
- Screenshots: Taken on failure (saved to `cypress/screenshots/`)
- Videos: Available when enabled (saved to `cypress/videos/`)

## Test Safety

- All test data uses `Test_E2E_` prefix
- Custom commands prevent touching real user data
- Automatic cleanup after each test
- Data-cy selectors ensure test stability