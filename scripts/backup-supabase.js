#!/usr/bin/env node

/**
 * Supabase Backup Script
 *
 * This script exports data from Supabase tables and saves it to the .backups folder.
 * It uses the Supabase JS client to fetch data and requires authentication.
 *
 * Usage:
 *   node scripts/backup-supabase.js
 *
 * Environment variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_KEY - Supabase service role key (for admin access)
 *   BACKUP_EMAIL - Email for authentication
 *   BACKUP_PASSWORD - Password for authentication
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Sanitize function for log injection prevention
const sanitizeForLog = (input) => encodeURIComponent(String(input)).replace(/%20/g, ' ');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BACKUP_EMAIL = process.env.BACKUP_EMAIL;
const BACKUP_PASSWORD = process.env.BACKUP_PASSWORD;
const TABLES = ['credit_cards_simplified', 'expenses', 'todos', 'plaid_tokens'];
const BACKUP_DIR = path.join(__dirname, '../.backups');

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.'
  );
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');
  console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'Set' : 'Not set');
  process.exit(1);
}

if (!BACKUP_EMAIL || !BACKUP_PASSWORD) {
  console.error(
    '❌ Missing backup credentials. Set BACKUP_EMAIL and BACKUP_PASSWORD environment variables.'
  );
  console.log('BACKUP_EMAIL:', BACKUP_EMAIL ? 'Set' : 'Not set');
  console.log('BACKUP_PASSWORD:', BACKUP_PASSWORD ? 'Set' : 'Not set');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initialize Supabase client
console.log(`Initializing Supabase client with URL: ${sanitizeForLog(SUPABASE_URL.substring(0, 20))}...`);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backupTables() {
  console.log('🔐 Authenticating with Supabase...');
  console.log(`Using email: ${sanitizeForLog(BACKUP_EMAIL)}`);

  try {
    // Sign in with provided credentials
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: BACKUP_EMAIL,
      password: BACKUP_PASSWORD,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      process.exit(1);
    }

    console.log('✅ Authentication successful');
    console.log('User:', data?.user?.email || 'Unknown');

    // Create timestamp for backup files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Export each table
    for (const table of TABLES) {
      console.log(`📤 Exporting ${table}...`);

      try {
        // Fetch all data from the table
        const { data, error } = await supabase.from(table).select('*');

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

        console.log(`✅ Exported ${data.length} records from ${sanitizeForLog(table)} to ${sanitizeForLog(backupFile)}`);
      } catch (error) {
        console.error(`❌ Error processing ${sanitizeForLog(table)}:`, sanitizeForLog(error.message));
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
