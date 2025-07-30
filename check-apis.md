# Firebase APIs to Enable

Go to Google Cloud Console → APIs & Services → Library

Search for and ENABLE these APIs:
1. **Firebase Cloud Messaging API**
2. **Firebase Installations API** 
3. **Firebase Management API**

Current error suggests the FCM API is not enabled for your project.

## Steps:
1. Go to https://console.cloud.google.com/apis/library
2. Select project: finance-to-dos
3. Search "Firebase Cloud Messaging API"
4. Click "ENABLE"
5. Search "Firebase Installations API" 
6. Click "ENABLE"

This should fix the 403 "unregistered callers" error.