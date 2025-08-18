#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptions() {
  console.log('🔍 Checking push_subscriptions table...');

  try {
    const { data, error } = await supabase.from('push_subscriptions').select('*');

    if (error) {
      console.log('❌ Error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('📋 Table push_subscriptions does not exist!');
        console.log('🔧 Need to create the table in Supabase');
      }
    } else {
      console.log('✅ Table exists');
      console.log('📊 Subscriptions found:', data.length);
      if (data.length > 0) {
        console.log('📱 Subscriptions:', data);
      }
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

checkSubscriptions();
