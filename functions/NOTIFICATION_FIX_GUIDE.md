# Push Notification Fix Guide

This guide will help you fix the "Requested entity was not found" error in your Firebase Cloud Messaging (FCM) push notifications.

## Step 1: Check Current FCM Tokens

First, check what tokens are currently in your database:

```bash
cd functions
node check-tokens.js
```

This will show all FCM tokens stored in your database.

## Step 2: Remove Invalid Tokens

Run the script to remove any invalid tokens:

```bash
node fix-tokens.js
```

## Step 3: Update Error Handling

Run the script to update the error handling in your Cloud Function:

```bash
node fix-notifications.js
```

## Step 4: Deploy Updated Function

Deploy the updated Cloud Function to Firebase:

```bash
firebase deploy --only functions
```

## Step 5: Register a New FCM Token

1. Open your app in a browser
2. Allow notifications when prompted
3. The app should automatically register the new token

## Step 6: Test the Notification

Trigger the notification function manually:

```bash
curl -X POST "https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY&sendPush=true"
```

Replace `YOUR_API_KEY` with your actual API key.

## Troubleshooting

If you're still having issues:

1. Check the Firebase Cloud Functions logs for any errors
2. Verify that notification permissions are granted in your browser
3. Try using a different browser or device
4. Make sure your Firebase project is properly configured for FCM

## Common Issues

- **Invalid FCM Token**: The token stored in your database is no longer valid
- **Missing Permissions**: The browser doesn't have permission to receive notifications
- **Service Worker Issues**: The service worker isn't properly registered
- **Firebase Configuration**: The Firebase configuration in your app doesn't match the project