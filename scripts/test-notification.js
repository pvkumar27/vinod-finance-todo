// For Node.js 18+, use the built-in fetch API
// For older Node.js versions, we need to use node-fetch differently
let fetch;
if (parseInt(process.versions.node) >= 18) {
  // Node.js 18+ has built-in fetch
  fetch = global.fetch;
} else {
  // For older Node.js versions
  const nodeFetch = require('node-fetch');
  fetch = nodeFetch;
}

// Function URL and API key from Firebase config
const functionUrl = 'https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders';
const apiKey = 'fintask-api-key-123'; // The key we set in Firebase Functions config

async function testNotification() {
  try {
    console.log('Sending test notification request...');
    const response = await fetch(`${functionUrl}?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    console.log('Response:', data);
    console.log('Status:', response.status);

    if (response.status === 200) {
      console.log('✅ Notification sent successfully!');
    } else {
      console.log('❌ Failed to send notification.');
    }
  } catch (error) {
    console.error('Error testing notification:', error);
  }
}

testNotification();
