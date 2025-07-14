#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
  console.log('❌ Please provide a version number');
  console.log('Usage: npm run release v1.8.1');
  process.exit(1);
}

console.log(`🚀 Starting release process for ${newVersion}...\n`);

// 1. Run pre-release checks
console.log('🔍 Running pre-release checks...');
try {
  execSync('node scripts/pre-release.js', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Pre-release checks failed');
  process.exit(1);
}

// 2. Update version in version.js
console.log(`📝 Updating version to ${newVersion}...`);
const versionFile = path.join(__dirname, '../src/constants/version.js');
const versionContent = `export const APP_VERSION = '${newVersion}';\n`;
fs.writeFileSync(versionFile, versionContent);
console.log('✅ Version updated\n');

// 3. Commit changes
console.log('📦 Committing changes...');
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "Release ${newVersion}: Package updates and version bump"`, { stdio: 'inherit' });

// 4. Create tag
console.log('🏷️  Creating git tag...');
execSync(`git tag ${newVersion}`, { stdio: 'inherit' });

// 5. Push to repository
console.log('🚀 Pushing to repository...');
execSync('git push', { stdio: 'inherit' });
execSync('git push --tags', { stdio: 'inherit' });

console.log(`\n🎉 Release ${newVersion} completed successfully!`);
console.log('🌐 Netlify will auto-deploy the new version');
console.log(`📋 Don't forget to update CHANGELOG.md with release notes`);