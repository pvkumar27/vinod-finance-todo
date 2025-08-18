#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Sanitize function for log injection prevention
const sanitizeForLog = (input) => encodeURIComponent(String(input)).replace(/%20/g, ' ');

// Safe command execution
const safeExec = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  return result.stdout ? result.stdout.trim() : '';
};

// User confirmation prompt
const confirmAction = async (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

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

console.log(`🔄 Starting rollback to ${sanitizeForLog(targetVersion)}...`);

async function performRollback() {
  try {
    // Check if tag exists
    console.log('🔍 Checking if version tag exists...');
    safeExec('git', ['tag', '-l', targetVersion]);
    
    // Get current branch
    const currentBranch = safeExec('git', ['branch', '--show-current']);
    console.log(`📍 Current branch: ${sanitizeForLog(currentBranch)}`);
    
    // Confirm rollback with user
    console.log(`⚠️  WARNING: This will rollback to ${sanitizeForLog(targetVersion)}`);
    console.log('📋 Steps that will be performed:');
    console.log('   1. Checkout to target version');
    console.log('   2. Update version.js file');
    console.log('   3. Create rollback commit');
    console.log('   4. Push to production');
    
    const confirmed = await confirmAction('Do you want to continue with the rollback?');
    if (!confirmed) {
      console.log('❌ Rollback cancelled by user');
      process.exit(0);
    }
  
    // For now, we'll do a safe rollback by creating a new commit
    console.log(`\n🔄 Checking out files from ${sanitizeForLog(targetVersion)}...`);
    
    // Get the commit hash for the tag
    const commitHash = safeExec('git', ['rev-list', '-n', '1', targetVersion]);
    console.log(`📝 Target commit: ${sanitizeForLog(commitHash)}`);
    
    // Checkout files from target version (but stay on current branch)
    safeExec('git', ['checkout', targetVersion, '--', '.'], { stdio: 'inherit' });
    
    // Update version.js to reflect the rollback
    const versionPath = path.join(__dirname, '..', 'src', 'constants', 'version.js');
    const versionContent = `export const APP_VERSION = '${targetVersion}';`;
    fs.writeFileSync(versionPath, versionContent);
    
    console.log(`✅ Updated version.js to ${sanitizeForLog(targetVersion)}`);
    
    // Stage all changes
    safeExec('git', ['add', '.'], { stdio: 'inherit' });
    
    // Create rollback commit
    const commitMessage = `Rollback to ${targetVersion}`;
    safeExec('git', ['commit', '-m', commitMessage], { stdio: 'inherit' });
    
    console.log('✅ Created rollback commit');
    
    // Push to production
    console.log('🚀 Pushing rollback to production...');
    safeExec('git', ['push'], { stdio: 'inherit' });
  
    console.log(`\n🎉 Successfully rolled back to ${sanitizeForLog(targetVersion)}!`);
    console.log('🌐 Netlify will auto-deploy the rollback version');
    console.log('📱 Check your deployment URL in a few minutes');
    
  } catch (error) {
    console.error(`❌ Rollback failed: ${sanitizeForLog(error.message)}`);
    console.log('\n🔧 To manually rollback:');
    console.log(`   git checkout ${sanitizeForLog(targetVersion)} -- .`);
    console.log(`   # Update src/constants/version.js manually`);
    console.log('   git add . && git commit -m "Manual rollback"');
    console.log('   git push');
    process.exit(1);
  }
}

// Run the rollback
performRollback();