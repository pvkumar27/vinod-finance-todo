#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sanitize function for log injection prevention
const sanitizeForLog = (input) => encodeURIComponent(String(input)).replace(/%20/g, ' ');

// Safe command execution with secure PATH
const safeExec = (command, args, options = {}) => {
  const secureEnv = {
    ...process.env,
    PATH: process.platform === 'win32' 
      ? 'C:\\Windows\\System32;C:\\Windows'
      : '/usr/bin:/bin:/usr/local/bin'
  };
  const result = spawnSync(command, args, { 
    encoding: 'utf8', 
    stdio: 'inherit', 
    env: secureEnv,
    ...options 
  });
  if (result.error) throw result.error;
  return result;
};

const args = process.argv.slice(2);
const newVersion = args[0];

// Validate version format (vX.Y.Z or X.Y.Z)
function validateVersion(version) {
  const versionPattern = /^v?\d+\.\d+\.\d+$/;
  return versionPattern.test(version);
}

// Normalize version to ensure it starts with 'v'
function normalizeVersion(version) {
  if (version.startsWith('v')) {
    return version;
  }
  return `v${version}`;
}

// Get version without 'v' prefix for package.json
function getPackageVersion(version) {
  if (version.startsWith('v')) {
    return version.substring(1);
  }
  return version;
}

// Create a release branch
function createReleaseBranch(version) {
  const branchName = `release/${sanitizeForLog(version)}`;
  try {
    safeExec('git', ['checkout', '-b', branchName]);
    return branchName;
  } catch (error) {
    console.log(`❌ Failed to create branch ${sanitizeForLog(branchName)}`);
    throw error;
  }
}

// Main execution
if (!newVersion) {
  console.log('❌ Please provide a version number');
  console.log('Usage: npm run release v1.8.1');
  process.exit(1);
}

if (!validateVersion(newVersion)) {
  console.log('❌ Invalid version format. Please use semantic versioning (e.g., v1.2.3 or 1.2.3)');
  process.exit(1);
}

const normalizedVersion = normalizeVersion(newVersion);
const packageVersion = getPackageVersion(normalizedVersion);

console.log(`🚀 Starting release process for ${sanitizeForLog(normalizedVersion)}...\n`);

// 1. Run pre-release checks
console.log('🔍 Running pre-release checks...');
try {
  safeExec('node', ['scripts/pre-release.js']);
} catch (error) {
  console.log('❌ Pre-release checks failed');
  process.exit(1);
}

// 2. Create a release branch
console.log('🌿 Creating release branch...');
const branchName = createReleaseBranch(normalizedVersion);
console.log(`✅ Created branch ${sanitizeForLog(branchName)}\n`);

// 3. Update version in version.js
console.log(`📝 Updating version to ${sanitizeForLog(normalizedVersion)}...`);
const versionFile = path.join(__dirname, '../src/constants/version.js');
const versionContent = `export const APP_VERSION = '${normalizedVersion}';\n`;
fs.writeFileSync(versionFile, versionContent);
console.log('✅ Version updated in version.js');

// 4. Update version in package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = packageVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Version updated in package.json\n');

// 5. Update changelog
console.log('📋 Updating changelog...');
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Add new version entry at the top
const today = new Date().toISOString().split('T')[0];
const newEntry = `## ${normalizedVersion} - ${today}\n### 🚀 Release\n- **Version Update**: ${normalizedVersion}\n- **Package Updates**: Latest compatible versions\n- **Security Fixes**: Automated vulnerability patches\n- **Build Verification**: Production build tested\n\n---\n\n`;

// Find insertion point more robustly
const lines = changelog.split('\n');
let insertIndex = 2; // Default fallback
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('## ') && i > 0) {
    insertIndex = i;
    break;
  }
}
lines.splice(insertIndex, 0, newEntry);
changelog = lines.join('\n');

fs.writeFileSync(changelogPath, changelog);
console.log('✅ Changelog updated with release entry\n');

// 6. Commit changes
console.log('📦 Committing changes...');
try {
  safeExec('git', ['add', 'src/constants/version.js', 'package.json', 'CHANGELOG.md']);
  safeExec('git', ['commit', '-m', `Release ${normalizedVersion}: Package updates and version bump`]);

  // 7. Create tag
  console.log('🏷️  Creating git tag...');
  safeExec('git', ['tag', normalizedVersion]);

  // 8. Push branch and tag
  console.log('🚀 Pushing to repository...');
  safeExec('git', ['push', '-u', 'origin', branchName]);
  safeExec('git', ['push', '--tags']);
} catch (error) {
  console.log('❌ Git operations failed:', sanitizeForLog(error.message));
  process.exit(1);
}

// 9. Create PR
console.log('🔄 Creating pull request...');
try {
  const result = spawnSync('gh', [
    'pr', 'create',
    '--title', `Release ${normalizedVersion}`,
    '--body', `This PR updates the version to ${normalizedVersion}.\n\nChanges:\n- Updated version in package.json\n- Updated version in src/constants/version.js\n- Updated CHANGELOG.md with release notes`,
    '--base', 'main',
    '--head', branchName
  ], { 
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: process.platform === 'win32' 
        ? 'C:\\Windows\\System32;C:\\Windows'
        : '/usr/bin:/bin:/usr/local/bin'
    }
  });
  
  if (result.stdout) {
    console.log(`✅ Pull request created: ${sanitizeForLog(result.stdout.trim())}`);
  }
} catch (error) {
  console.log('❌ Failed to create PR. Please create it manually.');
  console.log(`Branch: ${sanitizeForLog(branchName)}`);
  console.log(`Base: main`);
  console.log(`Title: Release ${sanitizeForLog(normalizedVersion)}`);
}

console.log(`\n🎉 Release ${sanitizeForLog(normalizedVersion)} process completed successfully!`);
console.log('📋 Please review and merge the PR to complete the release.');
console.log('🌐 Netlify will auto-deploy the new version after merging.');
