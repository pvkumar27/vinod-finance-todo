# 📋 Release Checklist

## 🚀 Automated Release Process

### **Quick Release (Recommended)**
```bash
npm run release v1.8.1
```
This automatically runs all checks below.

### **Manual Release Steps**

#### **1. Pre-Release Checks**
```bash
npm run pre-release
```
- ✅ Check for outdated packages
- ✅ Update packages automatically
- ✅ Run security audit
- ✅ Run all tests
- ✅ Test build process

#### **2. Package Updates**
```bash
npm run check-updates    # Check what's outdated
npm run update-packages  # Update and fix security
```

#### **3. Version Update**
- Update `src/constants/version.js`
- Update `CHANGELOG.md` with release notes

#### **4. Git Operations**
```bash
git add .
git commit -m "Release v1.x.x: Description"
git tag v1.x.x
git push && git push --tags
```

## 🔄 **Why Packages Were Missed Before**

1. **No automation** - Manual process prone to human error
2. **No checklist** - Easy to forget steps
3. **No enforcement** - Nothing prevented releases without updates

## ✅ **Solutions Implemented**

1. **Automated scripts** - `pre-release.js` checks everything
2. **Package.json scripts** - Easy commands to run
3. **Release checklist** - This document for reference
4. **Integrated workflow** - One command does everything

## 📝 **Usage Examples**

```bash
# Check what packages need updates
npm run check-updates

# Update packages manually
npm run update-packages

# Run all pre-release checks
npm run pre-release

# Full automated release
npm run release v1.8.1
```

## 🚨 **Never Skip These Steps**
- Package updates check
- Security audit
- Test execution
- Build verification