# FinTask CI/CD Process & Branch Strategy

This document outlines the complete CI/CD process and branch strategy for the FinTask project.

## Branch Strategy

### Main Branches

- **`main`**: Production-ready code that is deployed to production
- **`feature/*`**: New features and enhancements (e.g., `feature/add-dark-mode`)
- **`hotfix/*`**: Urgent fixes for production issues (e.g., `hotfix/fix-login-error`)

### Development Workflow

1. **Create a branch**
   - For new features: `git checkout -b feature/feature-name main`
   - For bug fixes: `git checkout -b hotfix/fix-name main`

2. **Make changes**
   - Develop and test your changes locally
   - Commit frequently with meaningful commit messages

3. **Push changes**
   - `git push origin feature/feature-name`
   - This triggers CI/CD workflows

4. **Create Pull Request**
   - Create a PR from your branch to `main`
   - Add description of changes
   - Wait for CI/CD checks to complete

5. **Review & Merge**
   - Address any feedback from reviewers
   - Once all checks pass, merge to `main`
   - Delete the feature branch after merging

## CI/CD Process

### Workflows

The project uses the following GitHub Actions workflows:

1. **CI/CD Pipeline** (`ci-cd.yml`)
   - Runs unit tests
   - Builds the application
   - Handles versioning and release when merged to `main`

2. **E2E Tests** (`e2e-tests.yml`)
   - Builds the application
   - Starts a local server on port 3000
   - Runs login test to verify core functionality
   - Tests against `http://localhost:3000`

3. **Branch Protection Check** (`branch-protection.yml`)
   - Verifies branches are up-to-date with `main`
   - Prevents merging outdated code

### Workflow Triggers

- **Push to `main`, `feature/*`, `hotfix/*`**: Triggers CI/CD Pipeline and E2E Tests
- **Pull Request to `main`**: Triggers all three workflows
- **Manual trigger**: All workflows can be run manually from GitHub Actions tab

### Branch Protection Rules

The `main` branch is protected with the following rules:

1. **Require status checks to pass before merging**
   - CI/CD Pipeline
   - E2E Tests
   - Branch Protection Check

2. **Require branches to be up to date before merging**
   - Ensures PRs include the latest changes from `main`

3. **Include administrators**
   - Rules apply to everyone, including repository administrators

### Release Process

When code is merged to `main`:

1. **Version Increment**
   - The version is automatically incremented based on the latest tag
   - Version is stored in `package.json`

2. **Changelog Generation**
   - Release notes are generated from commit messages
   - Changes are categorized by type (feature, fix, etc.)

3. **Tagging**
   - Code is tagged with the new version number
   - Tags follow semantic versioning (e.g., `v1.2.3`)

4. **Deployment**
   - Netlify automatically deploys the new version
   - Deployment URL: https://fintask.netlify.app

## Testing Strategy

### Unit Tests
- Run as part of CI/CD Pipeline
- Test individual components and functions
- Command: `npm test -- --watchAll=false`

### End-to-End Tests
- Run as part of E2E Tests workflow
- Test user flows and integration
- Currently only running login test
- Command: `npx playwright test tests/e2e/auth/login.spec.js`

### Test Credentials
- Stored as GitHub repository secrets
- Never hardcoded in the repository
- Used only for automated testing

## Troubleshooting

### Failed Workflows
1. Check the specific error in the GitHub Actions logs
2. Most common issues:
   - Missing environment variables
   - Test failures
   - Build errors

### Branch Protection Issues
1. Ensure your branch is up to date with `main`
   - `git fetch origin`
   - `git rebase origin/main`
2. Verify all required status checks are passing

### Manual Release
If automatic release fails:
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

## Environment Variables

The following environment variables are required:

- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key
- `TEST_USER_EMAIL`: Email for test account
- `TEST_USER_PASSWORD`: Password for test account
- `REACT_APP_FIREBASE_API_KEY`: Firebase API key (optional)

These are stored as GitHub repository secrets and used by the CI/CD workflows.