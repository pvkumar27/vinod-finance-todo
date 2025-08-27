# FinTask

[![CI/CD Pipeline](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/ci-cd.yml)
[![E2E Tests](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/username/vinod-finance-todo/actions/workflows/e2e-tests.yml)

A Progressive Web App for managing finances and to-dos.

## 📚 Documentation

### 👥 Team Onboarding
- [**Knowledge Transfer Document**](ONBOARDING_KT.md) - **Comprehensive guide for new team members**
- [**Quick Reference Guide**](QUICK_REFERENCE.md) - **Essential commands and concepts**
- [AI Features Summary](AI_FEATURES_SUMMARY.md) - Current AI capabilities and implementation status
- [MCP Integration Guide](docs/MCP_INTEGRATION_GUIDE.md) - Model Context Protocol setup and usage

### 👨‍💻 Developer Resources
- [Developer Setup Guide](DEVELOPER_SETUP.md) - Complete setup instructions for new developers
- [Health Check Summary](HEALTH_CHECK_SUMMARY.md) - Latest repository health check results
- [Project Guidelines](docs/PWA_Project_Guidelines.md) - Project strategy and guidelines
- [API Architecture](docs/API_ARCHITECTURE.md) - Single source of truth API design

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

# AI Assistant & MCP Server
npm run mcp:setup     # Setup MCP server
npm run mcp:start     # Start MCP server
npm run mcp:dev       # Start MCP server in dev mode
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

## ❌ **Plaid Integration Removed**

**Note**: Plaid integration was removed in v3.0+ due to complexity and cost considerations.

### What was removed:
- Bank account connection via Plaid
- Automatic transaction import
- Credit card syncing from banks
- Plaid sandbox testing

### Current approach:
- Manual credit card entry only
- Focus on metadata tracking (no sensitive data)
- AI-powered insights without bank connections
- Simplified user experience

## 🤖 AI Assistant & MCP Server

FinTask includes an AI-powered assistant that provides intelligent insights and natural language interaction with your financial data.

### Features
- **Natural Language Queries**: Ask questions like "Show me pending todos" or "Which cards are inactive?"
- **Smart Insights**: AI-powered financial recommendations and alerts
- **Todo Management**: Add and manage tasks through conversation
- **Credit Card Analysis**: Get insights on utilization, inactivity, and promo expirations
- **Proactive Alerts**: AI surfaces issues before you ask
- **🍅 Pomodoro Timer**: Built-in focus sessions with task integration

### ❌ **Removed Features**
- **Expense Tracking**: Manual expense entry removed in v3.0+
- **Plaid Integration**: Bank connection removed due to complexity
- **Firebase Notifications**: Replaced with simpler web-push API
- **Transaction Analysis**: Focus shifted to credit card management only

### MCP Server Setup
```bash
# Quick setup (recommended)
npm run mcp:setup

# Manual setup
npm run mcp:install
cp mcp-server/.env.example mcp-server/.env
# Edit mcp-server/.env with your Supabase credentials
```

### Running the AI Assistant
```bash
# Start MCP server (in one terminal)
npm run mcp:start

# Start React app (in another terminal)
npm start
```

### AI Assistant Usage
- Click the chat bubble in the bottom-right corner
- Use quick actions or type natural language queries
- Examples:
  - _"Show me all my incomplete todos"_
  - _"Which credit cards haven't been used recently?"_
  - _"Add a todo to pay rent next month"_
  - _"Analyze my spending this quarter"_

## 🍅 Pomodoro Timer Integration

FinTask includes a built-in Pomodoro timer for enhanced productivity and focus sessions.

### Features
- **25-minute focus sessions** with automatic break cycles
- **Task integration** - Start Pomodoro directly from any todo
- **Visual progress ring** with real-time countdown
- **Authentic timer sounds** - Realistic ticking and completion chimes
- **Early completion** - Mark tasks done before 25 minutes
- **Skip breaks** - Jump back to work when ready
- **Mobile wake lock** - Keeps screen on during sessions
- **Celebration effects** - Confetti animation and success sounds

### How to Use
1. **Start Session**: Click the 🍅 button next to any todo
2. **Focus Time**: 25-minute timer with optional ticking sound
3. **Break Time**: Automatic 5-minute (short) or 15-minute (long) breaks
4. **Early Completion**: Click "Done Early" if task finishes before timer
5. **Skip Breaks**: Use "Skip Break" to return to work immediately

### Timer Controls
- **▶️ Start/Pause**: Control timer playback
- **✅ Done Early**: Complete task before 25 minutes
- **⏭️ Skip Break**: Jump back to work session
- **🔄 Reset**: Restart current session
- **🔊 Mute/Unmute**: Toggle ticking sound

### Pomodoro Cycles
- **Work**: 25 minutes focus time
- **Short Break**: 5 minutes (after 1st, 2nd, 3rd pomodoro)
- **Long Break**: 15 minutes (after 4th pomodoro)
- **Auto-switching**: Seamless transitions between work and breaks

### Mobile Optimization
- **Responsive design** - Works perfectly on all screen sizes
- **Touch-friendly controls** - Large buttons for mobile use
- **Screen wake lock** - Prevents phone from sleeping during sessions
- **Mobile audio support** - Ticking and completion sounds work on mobile

### Productivity Features
- **Task completion tracking** - See daily pomodoro count
- **Focus time display** - Shows actual time spent on tasks
- **Celebration animations** - Confetti and success sounds for completed tasks
- **Progress visualization** - Real-time progress ring and statistics

### MCP Server Architecture
```
AI Assistant (React) → MCP Client → MCP Server → Supabase Database
```

### Pomodoro Architecture
```
TaskManager → TaskPomodoroIntegration → PomodoroTimer → Audio/Visual Effects
```

## 🔔 Daily Notifications

The app uses Web Push API for daily notifications (Firebase removed):

### Daily Task Reminders
- Sends notifications at 8:00 AM Central Time via GitHub Actions scheduler
- Push notification via Web Push API with VAPID keys
- Supports both iOS and Android devices
- No external service dependencies (costs $0/month)

### Setup
1. Generate VAPID keys: `npm run generate-vapid`
2. Set up environment variables in `.env`
3. Configure GitHub Actions secrets for the daily trigger

### ❌ **Firebase Removed**
- Firebase Cloud Messaging removed in v3.0+
- Replaced with simpler Web Push API
- No Firebase project needed
- Reduced complexity and dependencies

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