# Check Firebase Project Billing

The 401 error for FCM token generation might be due to billing not being enabled.

## Steps to check:

1. **Go to Firebase Console** → **Project Settings** → **Usage and billing**
2. **Check if billing is enabled**
3. **If not enabled, click "Modify plan"**
4. **Select "Blaze (Pay as you go)" plan**
5. **Add a billing account**

## Why FCM needs billing:
- FCM token generation requires Firebase project to have billing enabled
- Even if you stay within free tier limits
- This is a Firebase requirement for security/spam prevention

## Alternative check:
1. **Go to Google Cloud Console** → **Billing**
2. **Select your project: finance-to-dos**
3. **Ensure billing account is linked**

This should resolve the 401 "missing authentication credential" error.