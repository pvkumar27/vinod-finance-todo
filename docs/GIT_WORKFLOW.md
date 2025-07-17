# FinTask Git Workflow

## Feature Branch Strategy

### Overview
This document outlines our Git workflow for FinTask development to prevent code loss and maintain a stable main branch.

### Workflow Steps

#### 1. Create Feature Branch
```bash
# Ensure main is up to date
git checkout main
git pull

# Create feature branch
git checkout -b feature/descriptive-name
```

#### 2. Development Cycle
```bash
# Make changes to code
# Commit frequently with descriptive messages
git add .
git commit -m "Implement feature X"

# Push to remote immediately after each commit
git push -u origin feature/descriptive-name
```

#### 3. Keep Branch Updated
```bash
# Regularly sync with main
git fetch origin
git merge origin/main

# Resolve any conflicts
# Push updates
git push
```

#### 4. Quality Assurance
- Run tests locally before requesting review
- Ensure all CI/CD checks pass
- Fix any issues on the feature branch

#### 5. Code Review & Merge
- Create Pull Request via GitHub
- Address review feedback on feature branch
- Merge to main only after approval and passing CI/CD
- Use "Squash and merge" for cleaner history

#### 6. Clean Up
```bash
# Delete local branch
git checkout main
git pull
git branch -d feature/descriptive-name

# Delete remote branch
git push origin --delete feature/descriptive-name
```

### Best Practices

- **Branch Naming**: Use prefixes like `feature/`, `bugfix/`, `hotfix/`
- **Commit Messages**: Write clear, descriptive messages
- **Push Frequency**: Push after each meaningful commit
- **PR Size**: Keep PRs focused on single features/fixes
- **CI/CD**: Never bypass automated checks
- **Documentation**: Update relevant docs with code changes

### Recovery Procedures

If work is lost locally:
1. Check if pushed to remote branch
2. Use `git reflog` to find lost commits
3. Contact team lead if recovery attempts fail

## Incident Prevention

### Preventing Lost Work
- **Commit Frequently**: Make smaller, more frequent commits
- **Push After Each Commit**: Immediately push commits to remote
- **Use Git Stash**: Before switching branches or pulling changes
- **Avoid Hard Reset**: Use safer alternatives to `git reset --hard`

### Lessons From Past Incidents
- Tool crashes (like IDE or AI assistants) can interrupt Git workflows
- Merge conflict resolution requires careful attention
- Branch switching without committing changes can cause work loss
- Understanding Git's internal model is crucial for recovery operations

## Release Process

The release process follows these steps:

1. Complete feature development on branch
2. Merge approved PR to main
3. Run the release script:
   ```bash
   npm run release v2.x.x
   ```
4. The script will:
   - Run pre-release checks
   - Update version number
   - Create git tag
   - Update changelog
   - Push changes to remote

---

*This workflow ensures all development work is safely stored in remote branches and properly tested before integration into the main codebase.*