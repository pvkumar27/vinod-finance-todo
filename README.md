# Finance To-Dos PWA

A Progressive Web App for managing finances and to-dos.

## 🧪 End-to-End Testing

Automated E2E testing with Playwright ensures PWA functionality across devices:

### Quick Start
```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with browser UI
npm run test:e2e:headed

# Interactive test runner
npm run test:e2e:ui

# Run specific test file
npx playwright test playwright/tests/my-finances.spec.js

# Run tests with cleanup
./playwright/run-tests.sh

# Run UI test runner in Codespaces
./playwright/run-ui.sh
```

### Test Coverage
- ✅ **My Finances Form**: Owner/Sync Source dropdowns, defaults, persistence
- ✅ **Plaid Integration**: Bank connection, synced badges, transaction import
- ✅ **CRUD Operations**: Create, edit, delete for Cards/Finances/To-Dos
- ✅ **Responsive Design**: Mobile (375px), Tablet (768px), Desktop (1280px)
- ✅ **Navigation**: Tab switching, state management, error handling

### Test Data Management & Safety
- **🔒 SAFE**: All test entries use `Test_E2E_` prefix with unique IDs
- **🔒 SAFE**: Multiple validation layers prevent touching real user data
- **🔒 SAFE**: Form filling only occurs on empty fields or existing test data
- **🔒 SAFE**: Deletion only targets items with strict test prefixes
- **🔒 SAFE**: Real data pattern detection prevents accidental modifications
- Automatic cleanup after each test run
- Manual cleanup: `npx playwright test playwright/tests/cleanup.spec.js`
- All test actions are logged for transparency

### Configuration
- **Base URL**: `https://finance-todos.netlify.app/` (configurable via BASE_URL env var)
- **Browsers**: Chromium (mobile/tablet/desktop viewports)
- **Screenshots**: On failure only
- **Traces**: On first retry

### Authentication
For tests requiring authentication:
1. Update credentials in `playwright/fixtures/test-credentials.js` with valid login details
2. All tests use the login helper function from `playwright/helpers/test-helpers.js`
3. No need for complex authentication state management