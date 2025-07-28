# 🚀 Automated Release Guide

## 📋 Overview
FinTask now has automated versioning and releases! No more manual version bumps.

## 🤖 Automatic Releases

### How it works:
- **Triggers**: Every push to `main` branch
- **Version Detection**: Based on commit messages and file changes
- **Auto-Deploy**: Creates release → Netlify deploys automatically

### Version Bump Rules:
```bash
# MAJOR (v2.4.0 → v3.0.0)
git commit -m "feat: new dashboard [major]"
git commit -m "BREAKING: remove old API [breaking]"

# MINOR (v2.4.0 → v2.5.0) 
git commit -m "feat: add notification settings [feature]"
git commit -m "Add new component [minor]"
# OR: Changes to src/components/ or src/pages/

# PATCH (v2.4.0 → v2.4.1)
git commit -m "fix: notification bug"
git commit -m "Update styles"
# OR: Any other changes
```

### Skip Auto-Release:
```bash
git commit -m "docs: update README [skip release]"
```

## 🎯 Manual Releases

### GitHub Actions UI:
1. Go to **Actions** → **Semantic Release**
2. Click **Run workflow**
3. Choose: `patch`, `minor`, or `major`
4. Click **Run workflow**

### Command Line:
```bash
# Still works for local testing
npm run release v2.4.1
```

## 📊 What Gets Created:

### Every Release:
- ✅ **Version bump** in `package.json` and `version.js`
- ✅ **Git tag** (e.g., `v2.4.1`)
- ✅ **Changelog entry** with release notes
- ✅ **GitHub Release** with description
- ✅ **Automatic deployment** to production

### Release Branch:
- Creates `release/vX.Y.Z` branch
- Creates PR to main
- Auto-merges after CI passes

## 🔍 Monitoring Releases:

### Check Current Version:
- **Production**: Visit https://fintask.netlify.app (bottom of page)
- **Code**: Check `src/constants/version.js`
- **Package**: Check `package.json`

### Release History:
- **GitHub**: Releases tab
- **Local**: `git tag -l`
- **Changelog**: `CHANGELOG.md`

## 🛠️ Troubleshooting:

### Release Failed:
1. Check **Actions** tab for error details
2. Common issues:
   - Build failures
   - Test failures
   - Version conflicts

### Manual Override:
```bash
# If automation fails, manual release still works
npm run release v2.4.2
```

### Rollback:
```bash
# Use existing rollback script
npm run rollback v2.4.0
```

## 📝 Best Practices:

### Commit Messages:
```bash
# Good - Clear intent
git commit -m "feat: add iOS notification support [minor]"
git commit -m "fix: resolve FCM authentication error"

# Avoid - Unclear
git commit -m "updates"
git commit -m "changes"
```

### Development Flow:
1. **Feature branch** → develop
2. **PR to main** → review & merge  
3. **Auto-release** → triggers on merge
4. **Production** → deployed automatically

## 🎉 Benefits:

- ✅ **No manual version management**
- ✅ **Consistent release process**
- ✅ **Automatic deployment tracking**
- ✅ **Clear release history**
- ✅ **Rollback capability**
- ✅ **Professional workflow**

---

*Now you can focus on building features instead of managing releases!* 🚀