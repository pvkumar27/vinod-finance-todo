#!/usr/bin/env node

/**
 * Update package.json with admin backup script
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add admin backup script
packageJson.scripts['backup:admin'] = 'node scripts/backup-supabase-admin.js';

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Updated package.json with admin backup script');
console.log('- npm run backup:admin: Run the admin backup script (no auth required)');