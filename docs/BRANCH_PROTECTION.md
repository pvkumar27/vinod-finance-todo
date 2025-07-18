# Branch Protection Setup

To enforce CI/CD checks before merging to main, follow these steps to set up branch protection rules in GitHub:

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click on "Branches"
4. Under "Branch protection rules", click "Add rule"
5. In "Branch name pattern", enter `main`
6. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
7. In the "Status checks that are required" search box, search for and select:
   - `test` (from CI/CD Pipeline)
   - `test-local` (from Test Local Environment)
8. Enable these additional options:
   - ✅ Include administrators
   - ✅ Restrict who can push to matching branches
9. Click "Create" or "Save changes"

This configuration ensures:
- All changes to main must go through a pull request
- CI/CD checks must pass before merging
- Even repository administrators must follow these rules
- Branches must be up to date with main before merging

## Workflow for Feature Development

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit them
3. Push to GitHub: `git push -u origin feature/your-feature-name`
4. Create a Pull Request to main
5. Wait for CI/CD checks to pass
6. Merge the PR
7. CI/CD will automatically run on main after merge