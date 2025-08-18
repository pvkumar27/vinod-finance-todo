#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubscriptionSave() {
  console.log('🧪 Testing manual subscription save...');

  // Test subscription object (similar to what browser generates)
  const testSubscription = {
    endpoint: 'https://web.push.apple.com/test-endpoint',
    keys: {
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key',
    },
  };

  try {
    // Try to insert without user_id first (to test table structure)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        subscription: JSON.stringify(testSubscription),
        endpoint: testSubscription.endpoint,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('🔍 Error details:', error);
    } else {
      console.log('✅ Test subscription saved successfully!');
      console.log('📊 Saved data:', data);

      // Clean up test data
      await supabase.from('push_subscriptions').delete().eq('endpoint', testSubscription.endpoint);
      console.log('🧹 Cleaned up test data');
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testSubscriptionSave();
