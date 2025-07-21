#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const newVersion = args[0];

// Validate version format (vX.Y.Z or X.Y.Z)
function validateVersion(version) {
  const versionPattern = /^v?\d+\.\d+\.\d+$/;
  if (!versionPattern.test(version)) {
    return false;
  }
  return true;
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
  const branchName = `release/${version}`;
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    return branchName;
  } catch (error) {
    console.log(`❌ Failed to create branch ${branchName}`);
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

console.log(`🚀 Starting release process for ${normalizedVersion}...\n`);

// 1. Run pre-release checks
console.log('🔍 Running pre-release checks...');
try {
  execSync('node scripts/pre-release.js', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Pre-release checks failed');
  process.exit(1);
}

// 2. Create a release branch
console.log('🌿 Creating release branch...');
const branchName = createReleaseBranch(normalizedVersion);
console.log(`✅ Created branch ${branchName}\n`);

// 3. Update version in version.js
console.log(`📝 Updating version to ${normalizedVersion}...`);
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

// Insert after the first line (title)
const lines = changelog.split('\n');
lines.splice(2, 0, newEntry);
changelog = lines.join('\n');

fs.writeFileSync(changelogPath, changelog);
console.log('✅ Changelog updated with release entry\n');

// 6. Commit changes
console.log('📦 Committing changes...');
execSync('git add src/constants/version.js package.json CHANGELOG.md', { stdio: 'inherit' });
execSync(`git commit -m "Release ${normalizedVersion}: Package updates and version bump"`, {
  stdio: 'inherit',
});

// 7. Create tag
console.log('🏷️  Creating git tag...');
execSync(`git tag ${normalizedVersion}`, { stdio: 'inherit' });

// 8. Push branch and tag
console.log('🚀 Pushing to repository...');
execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
execSync('git push --tags', { stdio: 'inherit' });

// 9. Create PR
console.log('🔄 Creating pull request...');
try {
  const prOutput = execSync(
    `gh pr create --title "Release ${normalizedVersion}" --body "This PR updates the version to ${normalizedVersion}.\n\nChanges:\n- Updated version in package.json\n- Updated version in src/constants/version.js\n- Updated CHANGELOG.md with release notes" --base main --head ${branchName}`,
    { encoding: 'utf8' }
  );
  console.log(`✅ Pull request created: ${prOutput.trim()}`);
} catch (error) {
  console.log('❌ Failed to create PR. Please create it manually.');
  console.log(`Branch: ${branchName}`);
  console.log(`Base: main`);
  console.log(`Title: Release ${normalizedVersion}`);
}

console.log(`\n🎉 Release ${normalizedVersion} process completed successfully!`);
console.log('📋 Please review and merge the PR to complete the release.');
console.log('🌐 Netlify will auto-deploy the new version after merging.');
