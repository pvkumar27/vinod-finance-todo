// Test script to trigger push notification function
const https = require('https');

const API_KEY = 'AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM'; // Your Firebase API key
const PROJECT_ID = 'finance-to-dos';

// URL encode the API key
const encodedKey = encodeURIComponent(API_KEY);
const url = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/testPushNotification?key=${encodedKey}`;

console.log('Testing push notification function...');
console.log('URL:', url);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (data.includes('sent to') || data.includes('Test notifications')) {
      console.log('✅ Push notification test completed');
    } else {
      console.log('❌ Push notification test may have failed');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});