#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Auto-incrementing version...');

try {
  // Read current package.json version
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  let currentVersion = packageJson.version;

  // Auto-increment patch version for each build
  const versionParts = currentVersion.split('.');
  const major = parseInt(versionParts[0]);
  const minor = parseInt(versionParts[1]);
  const patch = parseInt(versionParts[2]) + 1;

  const newVersion = `v${major}.${minor}.${patch}`;
  const newPackageVersion = `${major}.${minor}.${patch}`;

  // Update package.json
  packageJson.version = newPackageVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

  // Update version.js
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  const versionContent = `export const APP_VERSION = '${newVersion}';\n`;
  fs.writeFileSync(versionPath, versionContent);

  console.log(`✅ Version auto-incremented: ${currentVersion} → ${newVersion}`);
  console.log(`📦 Package.json updated to: ${newPackageVersion}`);
} catch (error) {
  console.error('❌ Auto-version failed:', error.message);
  // Fallback to manual increment
  const fallbackVersion = 'v4.1.1';
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  fs.writeFileSync(versionPath, `export const APP_VERSION = '${fallbackVersion}';\n`);
  console.log(`🔄 Using fallback version: ${fallbackVersion}`);
}
