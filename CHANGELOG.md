# 📋 Release Notes - FinTask

## v2.5.0 - 2025-07-28
### 🚀 Release
- **Version Update**: v2.5.0
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.4.0 - 2025-07-28
### 🚀 Release
- **Version Update**: v2.4.0
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.3.2 - 2025-07-26
### 🐛 Bugfixes
- **Push Notifications**: Fixed "Requested entity was not found" error in Firebase Cloud Messaging
- **Email Links**: Updated all URLs from finance-to-dos.web.app to fintask.app
- **Mobile UI**: Optimized button sizes for better touch targets on mobile devices
- **Due Date**: Fixed date handling to prevent timezone issues with task due dates

### 🔧 Technical Improvements
- **Error Handling**: Added robust error handling for FCM token management
- **Token Cleanup**: Removed invalid FCM tokens from the database
- **Documentation**: Added comprehensive guides for notification testing and verification
- **Date Utilities**: Simplified date handling with consistent utility functions

---

## v2.3.1 - 2025-07-24
### 🧹 Repository Health Check & Cleanup
- **Security**: Removed hardcoded Firebase credentials from source code
- **Documentation**: Added comprehensive developer setup guide
- **Code Cleanup**: Moved obsolete test files to archive directory
- **Configuration**: Improved .env.example with all required variables
- **Backup**: Added .env.backup.example for backup configuration
- **Maintenance**: Created cleanup script for repository maintenance
- **Version Sync**: Synchronized version numbers across all files
- **Gitignore**: Updated to exclude additional generated directories

### 🔧 Technical Improvements
- **Documentation**: Created HEALTH_CHECK_SUMMARY.md with detailed findings
- **Build Process**: Fixed build issues with simplified test components
- **Dependencies**: Updated non-breaking dependencies
- **Security**: Identified and documented security vulnerabilities
- **CI/CD**: Fixed Package Upgrades workflow to use proper token permissions
- **Testing**: Updated React tests to use proper act() implementation

---

## v2.3.0 - 2025-07-20
### 🐛 Bugfixes for To-Dos
- **Due Date Fix**: Completely resolved date handling issues with a simpler approach
- **Mobile UI**: Further improved task card layout for iPhone 16 Pro Max
- **Action Buttons**: Optimized action buttons to take minimal space while remaining touch-friendly
- **Text Alignment**: Fixed left alignment of task descriptions and due dates
- **Edit UX**: Improved editing experience by auto-scrolling and focusing the input field

### 🔧 Technical Improvements
- **Date Handling**: Simplified date parsing to avoid timezone complications
- **Mobile Layout**: Enhanced UI density for better information display on mobile
- **Touch Targets**: Maintained accessibility with compact but usable touch targets

---

## v2.3.1 - 2025-07-22
### 🐛 Bugfixes for To-Dos
- **Due Date Fix**: Fixed issue with edited tasks showing one day earlier than selected date
- **Mobile UI**: Improved left alignment of task descriptions and due dates in card view
- **Space Optimization**: Reduced space occupied by action buttons in mobile view
- **Date Selection**: Added "Today" button for easier date selection on mobile devices
- **Noon Motivation**: Added midday push notification to motivate task completion
- **Email Formatting**: Modernized daily task reminder emails with improved styling

### 🔧 Technical Improvements
- **Timezone Handling**: Better handling of date strings to prevent timezone issues
- **Mobile Responsiveness**: Enhanced UI for smaller screens with optimized spacing
- **Notification System**: Added new notification type for midday motivation
- **Email Templates**: Redesigned email templates with modern HTML/CSS

---

## v2.3.0 - 2025-07-20
### 🔔 Push Notifications
- **Daily Task Reminders**: Added push notifications for daily tasks at 8:00 AM CT
- **Firebase Integration**: Implemented Firebase Cloud Messaging for reliable delivery
- **Permission Management**: Added user-friendly notification permission handling
- **Token Storage**: Secure storage of FCM tokens with improved validation
- **Cross-Browser Support**: Works on Chrome, Firefox, Edge, and Safari
- **Mobile Support**: Push notifications on both iOS and Android devices
- **Test Environment**: Added comprehensive test environment support

### 🔧 Technical Improvements
- **Service Worker**: Added Firebase messaging service worker
- **Token Validation**: Enhanced token validation and storage
- **Error Handling**: Improved error handling for notification permissions
- **Test Mocks**: Added mocks for testing notification components
- **Documentation**: Added upgrade plan for Node.js runtime

---

## v2.2.16 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.16
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.15 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.15
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.14 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.14
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.13 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.13
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.12 - 2025-07-19
### 🎨 UI Improvements
- **Homepage Redesign**: Made tab navigation the primary visual focus
- **Dashboard Cards**: Reduced prominence of dashboard cards for cleaner UI
- **Consistent Styling**: Applied uniform styling across all tabs (To-Dos, Credit Cards, Finances)
- **Task Management**: Made task cards more compact with reduced width and padding
- **Drag and Drop**: Fixed delay issue in task drag and drop functionality
- **Visual Hierarchy**: Improved overall visual hierarchy and user experience
- **Mobile Optimization**: Enhanced responsive behavior on smaller screens

---

## v2.2.11 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.11
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.10 - 2025-07-18
### 🚀 Release
- **Version Update**: v2.2.10
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.9 - 2025-07-17
### 🚀 Release
- **Version Update**: v2.2.9
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested
- **Full Recovery**: Complete restoration of all changes from lost commit ff1ba6d
- **Drag and Drop**: Implemented drag and drop for tasks with proper styling for pinned tasks
- **UI Enhancement**: Yellow background for pinned tasks during drag operations
- **Documentation**: Updated all documentation with consistent branding
- **CI/CD**: Improved GitHub Actions workflows

---


## v2.2.1 - 2025-07-17
### 🚀 Release
- **Version Update**: v2.2.1
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---


## v2.2.0 - 2025-07-17
### 🧪 QA Automation Framework
- **Playwright Integration**: Added comprehensive E2E testing framework
- **Test Structure**: Organized tests by feature in industry-standard folder structure
- **Production Safety**: Tests run against production URL with test data protection
- **Test Data Management**: All test data prefixed with `Test_E2E_` for safety
- **Cleanup Automation**: Automatic test data cleanup after test runs
- **CI Integration**: GitHub Actions workflow for automated testing
- **Multi-viewport Testing**: Mobile, tablet, and desktop viewport testing
- **Documentation**: Complete testing documentation and safety guidelines

### 🔧 Technical Improvements
- **Folder Structure**: Industry-standard test organization
- **Test Helpers**: Reusable authentication and data management utilities
- **GitIgnore Updates**: Excluded test artifacts from version control
- **Configuration**: Centralized test configuration with environment variables
- **Safety Measures**: Multiple layers of protection for production data

### 📚 Documentation Updates
- **Testing Guide**: Complete instructions for running tests
- **Safety Guidelines**: Clear documentation on test data handling
- **Folder Structure**: Detailed explanation of test organization
- **CI Integration**: Information on automated test runs

---

## v2.1.5 - 2025-07-17
### 🚀 Release
- **Version Update**: v2.1.5
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---

## v2.1.4 - 2025-07-16
### 🚀 Release
- **Version Update**: v2.1.4
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---

## v2.1.3 - 2025-07-16
### 🚀 Release
- **Version Update**: v2.1.3
- **Package Updates**: Latest compatible versions
- **Security Fixes**: Automated vulnerability patches
- **Build Verification**: Production build tested

---

## v2.1.3 - 2025-01-16
### 🧹 Final Plaid Integration Cleanup
- **Development Only**: Simplified to use development environment exclusively
- **Removed Conditional Logic**: Eliminated sandbox/production code paths
- **"Sandbox 1" Key Clarification**: Added comments explaining this key is for development
- **Cleaned Documentation**: Replaced production guides with development-only setup
- **Simplified Configuration**: Single environment setup reduces complexity

### 🔧 Code Simplification
- **Plaid Service**: Removed environment conditionals, development-only logic
- **PlaidLink Component**: Streamlined token exchange without environment checks
- **Configuration**: Fixed environment to 'development', removed dynamic switching

### 📚 Documentation Overhaul
- **New Guide**: PLAID-DEVELOPMENT-SETUP.md with complete setup instructions
- **Removed**: PLAID-PRODUCTION-SETUP.md (no longer needed)
- **Updated**: README with Plaid integration overview
- **Clarified**: "Sandbox 1" key usage in all documentation

### ✅ Final State
- **Single Environment**: Development environment only
- **Real Bank Connections**: Live financial institution integration
- **Free Tier**: No cost for personal use
- **Clean Codebase**: No unused conditional logic or configurations