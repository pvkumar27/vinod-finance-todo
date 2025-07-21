/**
 * Script to test the notification function
 */
const https = require('https');

// URL encode the API key
const apiKey = encodeURIComponent('ggUbeLe1auQ5Lb6B2zUR6Ag+XW/7ffOh');
const url = `https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=${apiKey}&sendPush=true`;

console.log(`Testing notification function with URL: ${url}`);

// Make the request
https.get(url, (res) => {
  let data = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', data);
    
    if (res.statusCode === 200) {
      console.log('\nSuccess! Check your email at pvkumar27@gmail.com for the notification.');
    } else {
      console.log('\nError: The function returned a non-200 status code.');
    }
  });
}).on('error', (err) => {
  console.error('Error making request:', err.message);
});