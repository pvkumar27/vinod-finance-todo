/**
 * Simple test script for the sendDailyTaskReminders function
 */
const https = require('https');

// Configuration
const functionUrl = 'https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders';
const apiKey = 'ggUbeLe1auQ5Lb6B2zUR6Ag+XW/7ffOh'; // This is a test key
const sendPush = true;

// Construct the URL with query parameters
const url = `${functionUrl}?key=${encodeURIComponent(apiKey)}&sendPush=${sendPush}`;

console.log(`Testing notification function with URL: ${url}\n`);

// Make the HTTP request
https.get(url, (res) => {
  let data = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log(`Response status: ${res.statusCode}`);
    console.log(`Response data: ${data}\n`);
    
    if (res.statusCode === 200) {
      console.log('Success! Check your email at pvkumar27@gmail.com for the notification.');
      console.log('If you received the notification but it only includes today\'s tasks:');
      console.log('1. The Cloud Function is working correctly');
      console.log('2. You need to deploy the updated function to include overdue tasks');
      console.log('\nTo deploy the updated function:');
      console.log('firebase deploy --only functions');
    } else {
      console.log('Error: The function returned a non-200 status code.');
    }
  });
}).on('error', (err) => {
  console.error(`Error: ${err.message}`);
});