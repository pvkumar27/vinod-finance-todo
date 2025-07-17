#!/usr/bin/env node

/**
 * Supabase Restore Script
 * 
 * This script restores data from backup files to Supabase tables.
 * It uses the Supabase JS client and requires admin credentials.
 * 
 * Usage:
 *   node scripts/restore-backup.js <backup-file-path>
 * 
 * Example:
 *   node scripts/restore-backup.js .backups/credit_cards_2025-07-17T12-00-00-000Z.json
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

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BACKUP_EMAIL = process.env.BACKUP_EMAIL;
const BACKUP_PASSWORD = process.env.BACKUP_PASSWORD;

// Get backup file path from command line arguments
const backupFilePath = process.argv[2];

if (!backupFilePath) {
  console.error('❌ Please provide a backup file path.');
  console.log('Usage: node scripts/restore-backup.js <backup-file-path>');
  process.exit(1);
}

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
  process.exit(1);
}

if (!BACKUP_EMAIL || !BACKUP_PASSWORD) {
  console.error('❌ Missing backup credentials. Set BACKUP_EMAIL and BACKUP_PASSWORD environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function restoreBackup() {
  console.log('🔐 Authenticating with Supabase...');
  
  // Sign in with provided credentials
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: BACKUP_EMAIL,
    password: BACKUP_PASSWORD,
  });
  
  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    process.exit(1);
  }
  
  console.log('✅ Authentication successful');
  
  // Read backup file
  console.log(`📥 Reading backup file: ${backupFilePath}`);
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    if (!Array.isArray(backupData) || backupData.length === 0) {
      console.error('❌ Invalid backup data. Expected non-empty array.');
      process.exit(1);
    }
    
    // Determine table name from file name
    const fileName = path.basename(backupFilePath);
    const tableName = fileName.split('_')[0];
    
    if (!tableName) {
      console.error('❌ Could not determine table name from file name.');
      process.exit(1);
    }
    
    console.log(`🔄 Restoring ${backupData.length} records to ${tableName}...`);
    
    // Confirm before proceeding
    console.log('⚠️  WARNING: This will overwrite existing data in the table.');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete existing data in the table
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting existing data:', deleteError.message);
      process.exit(1);
    }
    
    // Insert backup data
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(backupData);
    
    if (insertError) {
      console.error('❌ Error inserting backup data:', insertError.message);
      process.exit(1);
    }
    
    console.log(`✅ Successfully restored ${backupData.length} records to ${tableName}`);
  } catch (error) {
    console.error('❌ Error processing backup file:', error.message);
    process.exit(1);
  }
}

// Run the restore
restoreBackup().catch(error => {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
});