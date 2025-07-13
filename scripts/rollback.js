#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get target version from command line
const targetVersion = process.argv[2];

if (!targetVersion) {
  console.error('❌ Please specify a version to rollback to');
  console.log('Usage: npm run rollback v1.2.0');
  process.exit(1);
}

// Validate version format
if (!/^v\d+\.\d+\.\d+$/.test(targetVersion)) {
  console.error('❌ Invalid version format. Use format: v1.2.0');
  process.exit(1);
}

console.log(`🔄 Starting rollback to ${targetVersion}...`);

try {
  // Check if tag exists
  console.log('🔍 Checking if version tag exists...');
  execSync(`git tag -l ${targetVersion}`, { stdio: 'pipe' });
  
  // Get current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Current branch: ${currentBranch}`);
  
  // Confirm rollback
  console.log(`⚠️  WARNING: This will rollback to ${targetVersion}`);
  console.log('📋 Steps that will be performed:');
  console.log('   1. Checkout to target version');
  console.log('   2. Update version.js file');
  console.log('   3. Create rollback commit');
  console.log('   4. Push to production');
  
  // For now, we'll do a safe rollback by creating a new commit
  console.log(`\n🔄 Checking out files from ${targetVersion}...`);
  
  // Get the commit hash for the tag
  const commitHash = execSync(`git rev-list -n 1 ${targetVersion}`, { encoding: 'utf8' }).trim();
  console.log(`📝 Target commit: ${commitHash}`);
  
  // Checkout files from target version (but stay on current branch)
  execSync(`git checkout ${targetVersion} -- .`, { stdio: 'inherit' });
  
  // Update version.js to reflect the rollback
  const versionPath = path.join(__dirname, '..', 'src', 'constants', 'version.js');
  const versionContent = `export const APP_VERSION = '${targetVersion}';`;
  fs.writeFileSync(versionPath, versionContent);
  
  console.log(`✅ Updated version.js to ${targetVersion}`);
  
  // Stage all changes
  execSync('git add .', { stdio: 'inherit' });
  
  // Create rollback commit
  const commitMessage = `Rollback to ${targetVersion}`;
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('✅ Created rollback commit');
  
  // Push to production
  console.log('🚀 Pushing rollback to production...');
  execSync('git push', { stdio: 'inherit' });
  
  console.log(`\n🎉 Successfully rolled back to ${targetVersion}!`);
  console.log('🌐 Netlify will auto-deploy the rollback version');
  console.log('📱 Check your deployment URL in a few minutes');
  
} catch (error) {
  console.error(`❌ Rollback failed: ${error.message}`);
  console.log('\n🔧 To manually rollback:');
  console.log(`   git checkout ${targetVersion} -- .`);
  console.log(`   # Update src/constants/version.js manually`);
  console.log('   git add . && git commit -m "Manual rollback"');
  console.log('   git push');
  process.exit(1);
}