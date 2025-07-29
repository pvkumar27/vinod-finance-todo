#!/usr/bin/env node

/**
 * Test script to call the notification function
 */

const https = require('https');

async function testNotificationFunction() {
  console.log('Testing notification function...\n');

  // You'll need to replace YOUR_API_KEY with the actual key
  const apiKey = 'YOUR_API_KEY'; // Replace this with actual key
  const url = `https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=${apiKey}&sendPush=true`;

  console.log('URL:', url.replace(apiKey, 'HIDDEN_KEY'));
  console.log('Making request...\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '0'
      }
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);

    if (response.ok) {
      console.log('\n✅ Function call successful');
    } else {
      console.log('\n❌ Function call failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ for fetch support');
  console.log('Alternative: Use curl command or update Node.js');
  process.exit(1);
}

testNotificationFunction();