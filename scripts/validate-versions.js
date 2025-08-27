#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const packageVersion = `v${packageJson.version}`;

// Read version.js version
const versionPath = path.join(__dirname, '..', 'src', 'constants', 'version.js');
const versionContent = fs.readFileSync(versionPath, 'utf8');
const versionMatch = versionContent.match(/APP_VERSION = '(.+)'/);
const appVersion = versionMatch ? versionMatch[1] : null;

console.log(`Package.json version: ${packageVersion}`);
console.log(`App version: ${appVersion}`);

if (packageVersion !== appVersion) {
  console.log('❌ Version mismatch detected!');
  console.log(`   package.json: ${packageVersion}`);
  console.log(`   version.js: ${appVersion}`);
  process.exit(1);
}

console.log('✅ Versions are in sync');
