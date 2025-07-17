#!/usr/bin/env node

/**
 * Supabase Backup Script (Admin Version)
 * 
 * This script exports data from Supabase tables using the service role key.
 * No authentication required - uses admin access.
 * 
 * Usage:
 *   node scripts/backup-supabase-admin.js
 * 
 * Environment variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_KEY - Supabase service role key (for admin access)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLES = ['credit_cards', 'expenses', 'todos', 'plaid_tokens'];
const BACKUP_DIR = path.join(__dirname, '../.backups');

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');
  console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'Set' : 'Not set');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initialize Supabase client with service role key
console.log(`Initializing Supabase client with URL: ${SUPABASE_URL.substring(0, 20)}...`);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backupTables() {
  console.log('🔐 Using service role key for admin access...');
  
  try {
    // Create timestamp for backup files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Export each table
    for (const table of TABLES) {
      console.log(`📤 Exporting ${table}...`);
      
      try {
        // Fetch all data from the table
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) {
          console.error(`❌ Error exporting ${table}:`, error.message);
          continue;
        }
        
        if (!data || data.length === 0) {
          console.log(`ℹ️ No data found in ${table}`);
          continue;
        }
        
        // Write data to backup file
        const backupFile = path.join(BACKUP_DIR, `${table}_${timestamp}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        
        console.log(`✅ Exported ${data.length} records from ${table} to ${backupFile}`);
      } catch (error) {
        console.error(`❌ Error processing ${table}:`, error.message);
        console.error(error);
      }
    }
    
    console.log('🎉 Backup completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error during backup:', error);
    process.exit(1);
  }
}

// Run the backup
backupTables().catch(error => {
  console.error('❌ Backup failed:', error);
  process.exit(1);
});