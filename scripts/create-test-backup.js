#!/usr/bin/env node

/**
 * Create Test Backup Files
 * 
 * This script creates sample backup files for demonstration purposes.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../.backups');
const TABLES = ['credit_cards', 'expenses', 'todos', 'plaid_tokens'];

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create timestamp for backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Sample data for each table
const sampleData = {
  credit_cards: [
    {
      id: 1,
      created_at: new Date().toISOString(),
      name: "Sample Credit Card",
      number: "XXXX-XXXX-XXXX-1234",
      expiry: "12/25",
      cvv: "XXX",
      user_id: "sample-user-id",
      owner: "Self",
      sync_source: "Manual"
    }
  ],
  expenses: [
    {
      id: 1,
      created_at: new Date().toISOString(),
      description: "Sample Expense",
      amount: 123.45,
      category: "Food",
      user_id: "sample-user-id",
      owner: "Self",
      sync_source: "Manual"
    }
  ],
  todos: [
    {
      id: 1,
      created_at: new Date().toISOString(),
      title: "Sample Todo",
      description: "This is a sample todo item",
      completed: false,
      user_id: "sample-user-id"
    }
  ],
  plaid_tokens: [
    {
      id: 1,
      created_at: new Date().toISOString(),
      user_id: "sample-user-id",
      access_token: "access-sandbox-12345",
      item_id: "item-sandbox-12345",
      institution_name: "Sample Bank"
    }
  ]
};

// Create backup files
for (const table of TABLES) {
  console.log(`Creating sample backup for ${table}...`);
  
  const backupFile = path.join(BACKUP_DIR, `${table}_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(sampleData[table], null, 2));
  
  console.log(`✅ Created ${backupFile}`);
}

console.log('\n🎉 Sample backup files created successfully!');
console.log('These are demonstration files only and do not contain real data.');