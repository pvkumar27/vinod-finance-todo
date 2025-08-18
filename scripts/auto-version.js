#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Auto-generating version...');

try {
  // Get build info from Netlify environment or git
  const commitRef =
    process.env.COMMIT_REF || execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const buildId = process.env.BUILD_ID || Date.now().toString();
  const branch =
    process.env.BRANCH || execSync('git branch --show-current', { encoding: 'utf8' }).trim();

  // Generate version: v4.1.0-build.123-abc1234
  const baseVersion = 'v4.1.0';
  const autoVersion = `${baseVersion}-build.${buildId}-${commitRef}`;

  // Update version.js
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  const versionContent = `export const APP_VERSION = '${autoVersion}';\n`;
  fs.writeFileSync(versionPath, versionContent);

  console.log(`✅ Version updated: ${autoVersion}`);
  console.log(`📋 Branch: ${branch}`);
  console.log(`🔨 Build ID: ${buildId}`);
  console.log(`📝 Commit: ${commitRef}`);
} catch (error) {
  console.error('❌ Auto-version failed:', error.message);
  // Fallback to timestamp version
  const fallbackVersion = `v4.1.0-${Date.now()}`;
  const versionPath = path.join(__dirname, '../src/constants/version.js');
  fs.writeFileSync(versionPath, `export const APP_VERSION = '${fallbackVersion}';\n`);
  console.log(`🔄 Using fallback version: ${fallbackVersion}`);
}
