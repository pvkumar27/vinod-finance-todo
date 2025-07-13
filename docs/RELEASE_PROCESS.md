# 🚀 Release Process - Finance To-Dos PWA

## 📋 Release Workflow

### **Option 1: Automated Release (Recommended)**
```bash
# Single command release with automatic package updates
npm run release v1.5.0

# This automatically:
# - Updates all packages
# - Fixes security issues
# - Tests build
# - Updates version
# - Creates commit and tag
# - Pushes to production
```

### **Option 2: Manual Release Process**

### 1. **Development Phase**
```bash
# Local development and testing
npm start
# Test features thoroughly
# Fix any issues
```

### 2. **Automated Pre-Release Checks**
```bash
# Run automated pre-release script
npm run pre-release

# This automatically:
# - Updates all packages to latest versions
# - Fixes security vulnerabilities
# - Tests production build
# - Validates code quality
```

### 3. **Manual Pre-Release Checklist**
- [ ] All features working locally
- [ ] Forms validate properly
- [ ] Database operations successful
- [ ] Mobile responsive design verified
- [ ] PWA functionality tested

### 4. **Version Update**
```bash
# Update CHANGELOG.md with new version
# Update src/constants/version.js
# Document new features, bug fixes, improvements
```

### 5. **Git Release**
```bash
git add .
git commit -m "Release v1.x.x: [Brief description]"
git push

# Tag the release
git tag v1.x.x
git push --tags

# Update version constant
# Edit src/constants/version.js with new version
git add src/constants/version.js
git commit -m "Update version display to v1.x.x"
git push
```

### 6. **Post-Release**
- [ ] Verify Netlify auto-deployment
- [ ] Test production app at https://finance-todos-pwa.netlify.app
- [ ] Verify PWA installation works
- [ ] Check all modules function correctly
- [ ] Update project documentation if needed

## 📝 Commit Message Format

### **Feature Releases:**
```
Release v1.x.x: Add [feature name] with [key improvements]
```

### **Bug Fix Releases:**
```
Release v1.x.x: Fix [issue description] and improve [area]
```

### **Major Updates:**
```
Release v1.x.x: Major update with [list key features]
```

## 🏷️ Version Numbering

### **Format: v[MAJOR].[MINOR].[PATCH]**

- **MAJOR**: Breaking changes, major new features
- **MINOR**: New features, significant improvements
- **PATCH**: Bug fixes, small improvements

### **Examples:**
- `v1.0.0` - Initial release
- `v1.1.0` - Added natural language input
- `v1.1.1` - Fixed edit button bugs
- `v2.0.0` - Major UI overhaul with dashboards

## 📊 Release Tracking

### **Current Version:** v1.4.0
### **Next Planned:** v1.4.0 (Live Dashboards)
### **Release Frequency:** As features are completed
### **Testing Environment:** Local development server
### **Production Environment:** Netlify (https://finance-todos-pwa.netlify.app)

## 🔄 Rollback Process

### **If Issues Found in Production:**
1. Identify the problematic commit
2. Create hotfix branch if needed
3. Test fix locally
4. Deploy hotfix as patch version
5. Update CHANGELOG.md with hotfix details

### **Version-Based Rollback (Recommended):**
```bash
# Rollback to specific version
npm run rollback v1.2.0

# Verify available versions
git tag -l

# Check rollback status
git log --oneline -5
```

### **Emergency Rollback (Manual):**
```bash
# If automated script fails
git checkout v1.2.0 -- .
# Edit src/constants/version.js manually
git add . && git commit -m "Emergency rollback to v1.2.0"
git push
```

### **Post-Rollback Verification:**
- [ ] Check https://finance-todos-pwa.netlify.app loads
- [ ] Verify version display in UI footer
- [ ] Test core CRUD functionality
- [ ] Confirm PWA installation works