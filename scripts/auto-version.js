#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Auto-generating version...');

try {
  // Get build info from Netlify environment or git
  const commitRef =
    process.env.COMMIT_REF || execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const buildNumber = process.env.BUILD_ID
    ? process.env.BUILD_ID.slice(-6)
    : Math.floor(Date.now() / 1000)
        .toString()
        .slice(-6);
  const branch =
    process.env.BRANCH || execSync('git branch --show-current', { encoding: 'utf8' }).trim();

  // Generate version: v4.1.0-build.123456-abc1234
  const baseVersion = 'v4.1.0';
  const autoVersion = `${baseVersion}-build.${buildNumber}-${commitRef.slice(0, 7)}`;

  // Update version.js
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  const versionContent = `export const APP_VERSION = '${autoVersion}';\n`;
  fs.writeFileSync(versionPath, versionContent);

  console.log(`✅ Version updated: ${autoVersion}`);
  console.log(`📋 Branch: ${branch}`);
  console.log(`🔨 Build ID: ${buildNumber}`);
  console.log(`📝 Commit: ${commitRef}`);
} catch (error) {
  console.error('❌ Auto-version failed:', error.message);
  // Fallback to timestamp version
  const fallbackVersion = `v4.1.0-${Date.now()}`;
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  fs.writeFileSync(versionPath, `export const APP_VERSION = '${fallbackVersion}';\n`);
  console.log(`🔄 Using fallback version: ${fallbackVersion}`);
}
