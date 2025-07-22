# FCM Token Management Guide

This guide explains how to manage Firebase Cloud Messaging (FCM) tokens in the FinTask application.

## Overview

FCM tokens are used to send push notifications to specific devices. Each device that uses the FinTask app and enables notifications will register a unique FCM token. These tokens are stored in the `userTokens` collection in Firestore.

## Checking FCM Tokens

To check the current FCM tokens in the database:

1. Use the Firebase Console:
   - Go to https://console.firebase.google.com/project/finance-to-dos
   - Navigate to Firestore Database
   - Look for the `userTokens` collection

2. Use the HTTP endpoint:
   ```
   curl "https://us-central1-finance-to-dos.cloudfunctions.net/testPushNotification?key=YOUR_API_KEY"
   ```
   This will return information about the number of tokens found.

## Clearing All FCM Tokens

If you need to clear all FCM tokens (e.g., for testing or to fix issues with duplicate tokens):

1. Use the HTTP endpoint:
   ```
   curl "https://us-central1-finance-to-dos.cloudfunctions.net/clearAllTokens?key=YOUR_API_KEY"
   ```
   This will delete all tokens from the database.

2. After clearing tokens, users will need to re-register their devices by:
   - Opening the FinTask app
   - Allowing notifications when prompted
   - The app will automatically register a new FCM token

## Fixing Specific Token Issues

If you need to fix a specific token issue:

1. Use the HTTP endpoint:
   ```
   curl "https://us-central1-finance-to-dos.cloudfunctions.net/fixTokenRecord?key=YOUR_API_KEY"
   ```
   This will fix specific token issues identified in the code.

## Best Practices

1. **Regular Cleanup**: Periodically check for and remove invalid tokens
2. **Monitor Token Count**: If the token count seems unusually high, it may indicate duplicate registrations
3. **Test After Changes**: Always test push notifications after making changes to tokens
4. **User Communication**: Inform users if they need to re-register for notifications

## Troubleshooting

- **No FCM tokens found**: Users need to open the app and allow notifications
- **Push notifications not working**: Check if tokens are valid and properly registered
- **Too many tokens**: Clear all tokens and have users re-register