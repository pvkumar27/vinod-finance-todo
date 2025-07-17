#!/usr/bin/env node

/**
 * Test Supabase Connection
 * 
 * This script tests the connection to Supabase using the provided credentials.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BACKUP_EMAIL = process.env.BACKUP_EMAIL;
const BACKUP_PASSWORD = process.env.BACKUP_PASSWORD;

console.log('Supabase Test Script');
console.log('-------------------');
console.log('SUPABASE_URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : 'Not set');
console.log('SUPABASE_KEY:', SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 10)}...` : 'Not set');
console.log('BACKUP_EMAIL:', BACKUP_EMAIL || 'Not set');
console.log('BACKUP_PASSWORD:', BACKUP_PASSWORD ? '********' : 'Not set');
console.log('-------------------');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    console.log('1. Testing anonymous access...');
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.log('❌ Anonymous access failed:', versionError.message);
    } else {
      console.log('✅ Anonymous access successful');
      console.log('   Version:', versionData);
    }
    
    console.log('\n2. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: BACKUP_EMAIL,
      password: BACKUP_PASSWORD,
    });
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
    } else {
      console.log('✅ Authentication successful');
      console.log('   User:', authData.user.email);
      
      console.log('\n3. Testing data access...');
      const tables = ['credit_cards', 'expenses', 'todos', 'plaid_tokens'];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (error) {
            console.log(`❌ Failed to access ${table}:`, error.message);
          } else {
            console.log(`✅ Successfully accessed ${table}: ${count} records`);
          }
        } catch (error) {
          console.log(`❌ Error accessing ${table}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();