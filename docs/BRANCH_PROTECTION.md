# Branch Protection Setup

This document outlines how branch protection is set up for the FinTask repository.

## Branch Protection Rules

### Main Branch Protection

The `main` branch is protected with the following rules:

1. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - CI/CD Pipeline / CI Test
     - E2E Tests / E2E Test
     - Branch Protection Check / Branch Protection Check

2. **Include administrators**
   - Apply these rules to repository administrators as well

## Setting Up Branch Protection

To set up branch protection:

1. Go to the repository on GitHub
2. Click on "Settings"
3. Select "Branches" from the left sidebar
4. Under "Branch protection rules", click "Add rule"
5. Enter "main" as the branch name pattern
6. Configure the protection settings:
   - Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Search for and select the status checks:
     - CI/CD Pipeline / CI Test
     - E2E Tests / E2E Test
     - Branch Protection Check / Branch Protection Check
   - Check "Include administrators"
7. Click "Create" or "Save changes"

## Workflow Enforcement

The branch protection is enforced by GitHub Actions workflows:

- `ci-cd.yml`: Runs unit tests and builds the app
- `e2e-tests.yml`: Runs full login test against a local server
- `branch-protection.yml`: Checks if branches are up to date with main

Note: Currently, only the login test is run as part of CI/CD. Other tests are not yet ready for automated execution.

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Push your branch and create a pull request
4. Wait for all status checks to pass
5. Merge the pull request

## Troubleshooting

If you encounter issues with branch protection:

1. Check that your branch is up to date with `main`
2. Verify that all required status checks are passing
3. Check for any merge conflicts