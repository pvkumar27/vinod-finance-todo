# FinTask Firebase Functions (Spark Plan)

This directory contains Firebase Cloud Functions for the FinTask application, designed to work with the Firebase Spark (Free) Plan.

## Functions

### sendDailyTaskReminders

An HTTP-triggered function that sends daily task reminders via push notification.

#### Features:
- Works with Firebase Spark (Free) Plan
- Sends push notification using Firebase Cloud Messaging (FCM)
- Supports both iOS and Android devices
- Securely protected with API key

## Setup Requirements

### Environment Variables
Set the following environment variables in Firebase Console:
- `NOTIFICATION_API_KEY`: Secret key to authenticate requests

### Firestore Collections

#### todos
- `title`: Task title (string)
- `dueDate`: Due date (timestamp)
- `completed`: Completion status (boolean)

#### userTokens
- `token`: FCM token for the user's device (string)
- `deviceType`: "ios" or "android" (string)

## Triggering the Function

Since scheduled functions are not available on the Spark plan, you need to trigger this function externally. Options include:

### Option 1: GitHub Actions (Recommended)

Create a GitHub Action workflow to trigger the function daily:

```yaml
name: Daily Task Notifications

on:
  schedule:
    - cron: '0 8 * * *'  # 8:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  trigger-notification:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification function
        run: |
          curl -X POST "https://us-central1-[YOUR-PROJECT-ID].cloudfunctions.net/sendDailyTaskReminders?key=${{ secrets.NOTIFICATION_API_KEY }}"
```

### Option 2: Manual Trigger

You can manually trigger the function by visiting:
```
https://us-central1-[YOUR-PROJECT-ID].cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY
```

## Deployment

```bash
firebase deploy --only functions
```

## Limitations

- The function must be triggered externally (no built-in scheduler on Spark plan)
- Limited to 125K function invocations per month on Spark plan