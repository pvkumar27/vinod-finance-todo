#!/usr/bin/env node

/**
 * Update package.json with backup scripts
 * 
 * This script adds backup and restore scripts to package.json
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add backup scripts if they don't exist
if (!packageJson.scripts.backup) {
  packageJson.scripts.backup = 'node scripts/backup-supabase.js';
}

if (!packageJson.scripts.restore) {
  packageJson.scripts.restore = 'node scripts/restore-backup.js';
}

if (!packageJson.scripts['test:backup']) {
  packageJson.scripts['test:backup'] = 'node scripts/create-test-backup.js';
}

if (!packageJson.scripts['test:restore']) {
  packageJson.scripts['test:restore'] = 'node scripts/test-restore.js';
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Updated package.json with backup scripts');
console.log('Available scripts:');
console.log('- npm run backup: Run the backup script');
console.log('- npm run restore: Run the restore script');
console.log('- npm run test:backup: Create test backup files');
console.log('- npm run test:restore: Test restore functionality');