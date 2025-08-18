#!/usr/bin/env node

// Simple script to test push notifications manually
const https = require('https');

const API_KEY = 'fintask_notify_2025_secure_key_v1';
const NETLIFY_URL = 'https://fintask.netlify.app/.netlify/functions/send-push-reminders';

console.log('🧪 Testing push notification system...');

const url = `${NETLIFY_URL}?key=${encodeURIComponent(API_KEY)}`;

const req = https.request(url, { method: 'POST' }, res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📄 Response Body: ${data}`);

    if (res.statusCode === 200) {
      console.log('✅ Push notification test completed successfully!');
    } else {
      console.log('❌ Push notification test failed');
    }
  });
});

req.on('error', error => {
  console.error('❌ Request failed:', error.message);
});

req.end();
