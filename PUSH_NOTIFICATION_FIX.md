# Push Notification Fix Guide

## Issues Identified
1. **Truncated FCM Token**: The token in the database is incomplete
2. **Incorrect Device Type**: Device type is set to "android" but should be "ios"
3. **Incorrect Email**: Email is set to "pvkumar27@yahoo.com" but should be "pvkumar27@gmail.com"

## Fix Implementation
We've created a solution that:
1. Removes the invalid token record from the database
2. Updates the Cloud Function to handle "Requested entity was not found" errors
3. Provides a way to re-register the device with correct information

## How to Apply the Fix

### Step 1: Deploy the Updated Functions
```bash
cd functions
firebase deploy --only functions --project finance-to-dos
```

### Step 2: Run the Token Record Fix
```bash
node deploy-token-fix.js
```

### Step 3: Re-register Your Device
1. Open the FinTask app on your iOS device
2. Allow notifications when prompted
3. The app should automatically register a new token with:
   - Correct device type: "ios"
   - Correct email: "pvkumar27@gmail.com"
   - Complete FCM token

### Step 4: Verify Push Notifications
```bash
curl "https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY"
```
Replace `YOUR_API_KEY` with your actual API key (URL-encoded).

## Troubleshooting
If push notifications still don't work:

1. **Check Firebase Console**:
   - Go to Firebase Console > Firestore Database
   - Look for the `userTokens` collection
   - Verify the new token has been registered with correct values

2. **Check Function Logs**:
   - Go to Firebase Console > Functions
   - Check logs for the `sendDailyTaskReminders` function
   - Look for any errors related to FCM tokens

3. **Verify iOS Settings**:
   - Make sure notifications are enabled for the app in iOS settings
   - Check that the app has permission to send notifications

4. **Update Service Worker**:
   - Make sure the service worker is properly handling FCM messages
   - Check for any console errors in the browser