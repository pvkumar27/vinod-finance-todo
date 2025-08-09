# FinTask

[![CI/CD Pipeline](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml)
[![E2E Tests](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml)

A Progressive Web App for managing finances and to-dos.

## 📚 Documentation

- [Developer Setup Guide](DEVELOPER_SETUP.md) - Complete setup instructions for new developers
- [Health Check Summary](HEALTH_CHECK_SUMMARY.md) - Latest repository health check results
- [Project Guidelines](docs/PWA_Project_Guidelines.md) - Project strategy and guidelines

## 🧪 End-to-End Testing

Automated E2E testing with Cypress ensures PWA functionality across devices:

### Quick Start
```bash
# Interactive test runner (recommended)
npm run cypress:open

# Run all E2E tests (headless)
npm run test:e2e

# Run essential tests only
npm run test:e2e:essential

# Run specific test suites
npm run test:e2e:auth
npm run test:e2e:nav

# Run tests with browser visible
npm run test:e2e:headed

# Run tests in Chrome
npm run test:e2e:chrome
```

### Test Coverage
- ✅ **Authentication**: Login flow and session management
- ✅ **Navigation**: Tab switching between To-Dos and Credit Cards
- ✅ **To-Dos**: Create, edit, delete tasks with view mode switching
- ✅ **Credit Cards**: CRUD operations with search and filtering
- ✅ **Data-Cy Selectors**: Robust, maintainable test selectors
- ✅ **Responsive Design**: Mobile, tablet, desktop viewports

### Test Data Management & Safety
- **🔒 SAFE**: All test entries use `Test_E2E_` prefix with unique IDs
- **🔒 SAFE**: Custom commands prevent touching real user data
- **🔒 SAFE**: Automatic cleanup after each test run
- **🔒 SAFE**: Data-cy selectors ensure test stability

### Cypress Configuration
- **Base URL**: `http://localhost:3000`
- **Viewport**: 1280x720 (configurable)
- **Screenshots**: On failure only
- **Videos**: Disabled by default
- **Environment Variables**: `CYPRESS_TEST_USER_EMAIL`, `CYPRESS_TEST_USER_PASSWORD`

### Custom Commands
```javascript
// Login helper
cy.login()

// Generate test data
cy.generateTestData('todo')
cy.generateTestData('creditCard')

// Cleanup test data
cy.cleanupTestData()
```

### Data-Cy Selectors
Tests use semantic data-cy attributes for reliability:
```javascript
// Navigation
cy.get('[data-cy="nav-todos-tab"]')
cy.get('[data-cy="nav-cards-tab"]')

// To-Dos
cy.get('[data-cy="task-input-field"]')
cy.get('[data-cy="task-add-button"]')

// Credit Cards
cy.get('[data-cy="card-add-button"]')
cy.get('[data-cy="card-search-input"]')
```

### Authentication
Set environment variables for test credentials:
```bash
CYPRESS_TEST_USER_EMAIL=your-test-email@example.com
CYPRESS_TEST_USER_PASSWORD=your-test-password
```

## 🚀 CI/CD & Release Process

> For detailed CI/CD process and branch strategy, see [CI/CD Process Documentation](docs/CI_CD_PROCESS.md)

### Automated CI/CD
The project uses GitHub Actions for continuous integration and deployment:

- **E2E Tests**: Run on every push to `main`, `feature/*`, and `hotfix/*` branches
- **Branch Protection**: Prevents merging to main if tests fail
- **Local Testing**: All tests run against a local server in CI
- **Release Process**: Automated version bumping, changelog updates, and tagging
- **Netlify Deployment**: Auto-deploys from the `main` branch

### Branch Protection Rules
The repository has the following branch protection rules for the `main` branch:

- **Require status checks to pass**: All CI/CD checks must pass
- **Require branches to be up to date**: Branches must be up-to-date with the base branch
- **Include administrators**: Rules apply to administrators too

For detailed setup instructions, see [Branch Protection Documentation](docs/BRANCH_PROTECTION.md)

### Manual Release
```bash
# Check for outdated packages
npm run check-updates

# Update packages (if needed)
npm run update-packages

# Run pre-release checks
npm run pre-release

# Release with specific version
npm run release v2.2.1
```

### Release Process
1. Tests are run to ensure everything works
2. Version is bumped in `src/constants/version.js`
3. Changelog is updated with release notes
4. Changes are committed and tagged
5. Netlify automatically deploys the new version

## 💾 Backup & Restore

### Creating Backups
```bash
# Create a backup of all tables
npm run backup

# Backups are stored in .backups/ directory
```

### Restoring from Backup
```bash
# Restore a specific backup file
npm run restore .backups/credit_cards_2025-07-17T12-00-00-000Z.json
```

### Automated Backups
- Weekly backups are created via GitHub Actions
- Backups are stored in the `backup` branch
- You can manually trigger a backup from the Actions tab

### Environment Variables for Backup
Create a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
BACKUP_EMAIL=your_admin_email
BACKUP_PASSWORD=your_admin_password
```

## 🧪 Plaid Sandbox Testing

The app uses Plaid for bank account integration. For testing:

1. Use the "Connect Bank" button in the Credit Cards section
2. In the Plaid sandbox, use these credentials:
   - Username: `user_good`
   - Password: `pass_good`
   - Any MFA code will work (e.g., `1234`)
3. Select any bank account to connect
4. Credit cards will be imported with the 🏦 Plaid Synced badge

## 🔔 Daily Notifications

The app uses Firebase Blaze Plan (staying within free tier limits) for daily notifications:

### Daily Task Reminders
- Sends notifications at 8:00 AM Central Time via GitHub Actions scheduler
- Push notification via Firebase Cloud Messaging (FCM)
- Supports both iOS and Android devices
- Works within Firebase free tier limits (costs $0/month)

### Setup
1. Deploy the HTTP-triggered Cloud Function: `cd functions && npm run deploy`
2. Set up environment variables in Firebase Console
3. Configure GitHub Actions secrets for the daily trigger

## 📁 Project Structure
```
/
├── public/                # Static assets
├── src/                   # Application source code
├── functions/             # Firebase Cloud Functions
│   ├── index.js           # Cloud Functions code
│   └── package.json       # Functions dependencies
├── cypress/               # Cypress E2E tests
│   ├── e2e/               # Test files
│   │   ├── essential.cy.js      # Essential tests for CI/CD
│   │   ├── authentication.cy.js # Authentication tests
│   │   └── navigation.cy.js     # Navigation tests
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands and configuration
│       ├── commands.js    # Custom Cypress commands
│       └── e2e.js         # Support file
├── scripts/               # Utility scripts
│   ├── backup-supabase.js # Database backup script
│   ├── restore-backup.js  # Database restore script
│   ├── release.js         # Release automation
│   └── pre-release.js     # Pre-release checks
└── .github/workflows/     # GitHub Actions workflows
    ├── ci-cd.yml          # CI/CD pipeline
    ├── e2e-tests.yml      # E2E test workflow
    ├── package-upgrades.yml # Package upgrade workflow
    └── backup.yml         # Backup workflow
```