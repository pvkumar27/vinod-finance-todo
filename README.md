# FinTask

[![CI/CD Pipeline](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml)
[![E2E Tests](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml)

A Progressive Web App for managing finances and to-dos.

## 📚 Documentation

- [Developer Setup Guide](DEVELOPER_SETUP.md) - Complete setup instructions for new developers
- [Health Check Summary](HEALTH_CHECK_SUMMARY.md) - Latest repository health check results
- [Project Guidelines](docs/PWA_Project_Guidelines.md) - Project strategy and guidelines

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
npx playwright test tests/e2e/finances/my-finances.spec.js

# Run tests with cleanup
./tests/run-tests.sh

# Run ui in codespaces
npx playwright test --ui-host=0.0.0.0 --ui-port=8080

# Run Playwright UI with automatic port selection
npm run playwright


# Run only cleanup
npm run test:e2e:cleanup
```

### Test Coverage
- ✅ **Authentication**: Login flow and session management
- ✅ **My Finances**: Owner/Sync Source dropdowns, defaults, persistence
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
- Manual cleanup: `npm run test:e2e:cleanup`

### Configuration
- **Base URL**: `http://localhost:3000` by default, configurable via BASE_URL env var
- **Browsers**: Chromium (mobile/tablet/desktop viewports)
- **Screenshots**: On failure only
- **Traces**: On first retry

### Local Testing in CI
The CI pipeline automatically:
1. Builds the app
2. Starts a local server
3. Waits for the server to be ready
4. Runs tests against the local server

### Authentication
For tests requiring authentication:
1. Update credentials in `tests/fixtures/test-credentials.js` with valid login details
2. All tests use the login helper function from `tests/helpers/test-helpers.js`

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
├── tests/                 # Test files
│   ├── e2e/               # End-to-end tests
│   │   ├── auth/          # Authentication tests
│   │   ├── credit-cards/  # Credit card tests
│   │   ├── finances/      # Finance tests
│   │   ├── todos/         # To-do tests
│   │   └── utils/         # Utility tests
│   ├── fixtures/          # Test fixtures
│   ├── helpers/           # Test helpers
│   └── config/            # Test configuration
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