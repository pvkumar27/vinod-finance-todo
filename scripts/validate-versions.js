#!/usr/bin/env node

/**
 * This script validates that the versions in package.json and src/constants/version.js are in sync.
 * It can be used as a pre-commit hook to prevent commits with mismatched versions.
 */

const fs = require('fs');
const path = require('path');

// Read package.json version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version;

// Read version.js version
const versionFilePath = path.join(__dirname, '../src/constants/version.js');
const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
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
  console.error(`   - package.json: ${packageVersion}`);
  console.error(`   - version.js: ${appVersion} (normalized: ${normalizedAppVersion})`);
  console.error('Please update both files to use the same version.');
  process.exit(1);
}

console.log('✅ Versions are in sync:');
console.log(`   - package.json: ${packageVersion}`);
console.log(`   - version.js: ${appVersion}`);
process.exit(0);
