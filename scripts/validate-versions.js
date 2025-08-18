#!/usr/bin/env node

/**
 * This script validates that the versions in package.json and src/constants/version.js are in sync.
 * It can be used as a pre-commit hook to prevent commits with mismatched versions.
 */

const fs = require('fs');
const path = require('path');

// Sanitize function for log injection prevention
const sanitizeForLog = (input) => encodeURIComponent(String(input)).replace(/%20/g, ' ');

// Read package.json version with error handling
const packageJsonPath = path.join(__dirname, '../package.json');
try {
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  var packageVersion = packageJson.version;
} catch (error) {
  console.error('❌ Error reading package.json:', sanitizeForLog(error.message));
  process.exit(1);
}

// Read version.js version with error handling
const versionFilePath = path.join(__dirname, '../src/constants/version.js');
try {
  if (!fs.existsSync(versionFilePath)) {
    console.error('❌ version.js not found');
    process.exit(1);
  }
  var versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
} catch (error) {
  console.error('❌ Error reading version.js:', sanitizeForLog(error.message));
  process.exit(1);
}
const versionMatch = versionFileContent.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);

if (!versionMatch) {
  console.error('❌ Could not find APP_VERSION in src/constants/version.js');
  process.exit(1);
}

const appVersion = versionMatch[1];
const normalizedAppVersion = appVersion.startsWith('v') ? appVersion.substring(1) : appVersion;

// Compare versions
if (packageVersion !== normalizedAppVersion) {
  console.error('❌ Version mismatch:');
  console.error(`   - package.json: ${sanitizeForLog(packageVersion)}`);
  console.error(`   - version.js: ${sanitizeForLog(appVersion)} (normalized: ${sanitizeForLog(normalizedAppVersion)})`);
  console.error('Please update both files to use the same version.');
  process.exit(1);
}

console.log('✅ Versions are in sync:');
console.log(`   - package.json: ${sanitizeForLog(packageVersion)}`);
console.log(`   - version.js: ${sanitizeForLog(appVersion)}`);
process.exit(0);
