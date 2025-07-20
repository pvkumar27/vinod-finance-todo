#!/usr/bin/env node

/**
 * Simple script to send a test notification
 * Usage: node send-notification.js
 */

// Function URL and API key from Firebase config
const functionUrl = 'https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders';
const apiKey = 'fintask-api-key-123'; // The key we set in Firebase Functions config

async function sendNotification() {
  try {
    console.log('Sending notification...');

    const response = await fetch(`${functionUrl}?key=${apiKey}&sendPush=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();

    if (response.status === 200) {
      console.log('✅ Success:', data);
    } else {
      console.log('❌ Error:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
  }
}

sendNotification();
