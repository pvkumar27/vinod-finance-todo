#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
  console.log('❌ Please provide a version number');
  console.log('Usage: npm run release v4.3.1');
  process.exit(1);
}

// Validate version format
const versionRegex = /^v?\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
  console.log('❌ Invalid version format. Use: v4.3.1 or 4.3.1');
  process.exit(1);
}

const version = newVersion.startsWith('v') ? newVersion : `v${newVersion}`;
const versionNumber = version.substring(1);

console.log(`🚀 Starting release process for ${version}...`);

try {
  // 1. Update package.json
  console.log('📦 Updating package.json...');
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = versionNumber;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

  // 2. Update version.js
  console.log('📝 Updating version.js...');
  const versionPath = path.join(__dirname, '..', 'src', 'constants', 'version.js');
  const versionContent = `export const APP_VERSION = '${version}';\n`;
  fs.writeFileSync(versionPath, versionContent);

  // 3. Run pre-release checks
  console.log('🔍 Running pre-release checks...');
  execSync('npm run pre-release', { stdio: 'inherit' });

  // 4. Commit changes
  console.log('💾 Committing version changes...');
  execSync('git add package.json src/constants/version.js', { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });

  // 5. Create tag
  console.log('🏷️  Creating git tag...');
  execSync(`git tag -a ${version} -m "Release ${version}"`, { stdio: 'inherit' });

  // 6. Push changes and tag
  console.log('⬆️  Pushing to repository...');
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin ${version}`, { stdio: 'inherit' });

  console.log(`✅ Release ${version} completed successfully!`);
  console.log('🌐 Netlify will automatically deploy the new version');
} catch (error) {
  console.log('❌ Release failed:', error.message);
  process.exit(1);
}
