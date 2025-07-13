#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get target version from command line
const targetVersion = process.argv[2];

if (!targetVersion) {
  console.error('❌ Please specify a version for release');
  console.log('Usage: npm run release v1.5.0');
  process.exit(1);
}

// Validate version format
if (!/^v\d+\.\d+\.\d+$/.test(targetVersion)) {
  console.error('❌ Invalid version format. Use format: v1.5.0');
  process.exit(1);
}

console.log(`🚀 Starting release process for ${targetVersion}...\n`);

try {
  // 1. Run pre-release checks (includes package updates)
  console.log('📋 Step 1: Running pre-release checks...');
  execSync('npm run pre-release', { stdio: 'inherit' });
  
  // 2. Update version constant
  console.log(`\n📝 Step 2: Updating version to ${targetVersion}...`);
  const versionPath = path.join(__dirname, '..', 'src', 'constants', 'version.js');
  const versionContent = `export const APP_VERSION = '${targetVersion}';`;
  fs.writeFileSync(versionPath, versionContent);
  console.log('✅ Version constant updated');
  
  // 3. Prompt for CHANGELOG update
  console.log(`\n📚 Step 3: Please update CHANGELOG.md with ${targetVersion} release notes`);
  console.log('Press Enter when CHANGELOG.md is updated...');
  
  // Wait for user input (simplified for Windows)
  execSync('pause', { stdio: 'inherit' });
  
  // 4. Create release commit
  console.log('\n📦 Step 4: Creating release commit...');
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "Release ${targetVersion}: Automated release with package updates"`, { stdio: 'inherit' });
  
  // 5. Create git tag
  console.log(`\n🏷️  Step 5: Creating git tag ${targetVersion}...`);
  execSync(`git tag ${targetVersion}`, { stdio: 'inherit' });
  
  // 6. Push to production
  console.log('\n🚀 Step 6: Pushing to production...');
  execSync('git push && git push --tags', { stdio: 'inherit' });
  
  console.log(`\n🎉 Release ${targetVersion} completed successfully!`);
  console.log('📋 What was done:');
  console.log('   ✅ Packages updated to latest versions');
  console.log('   ✅ Security vulnerabilities fixed');
  console.log('   ✅ Production build tested');
  console.log('   ✅ Version constant updated');
  console.log('   ✅ Release commit created');
  console.log('   ✅ Git tag created');
  console.log('   ✅ Pushed to production');
  console.log('\n🌐 Netlify will deploy automatically');
  console.log('📱 Check https://vinod-pwa.netlify.app in a few minutes');
  
} catch (error) {
  console.error(`\n❌ Release failed: ${error.message}`);
  console.log('\n🔧 Manual steps to complete release:');
  console.log('   1. Fix the error above');
  console.log('   2. Run npm run pre-release');
  console.log('   3. Update version and CHANGELOG manually');
  console.log('   4. git add . && git commit && git push');
  process.exit(1);
}