# FinTask Notification Testing Guide

This guide explains how to test the various notification features in FinTask.

## Prerequisites

1. Node.js installed on your machine
2. Firebase Functions API key (ask your administrator)

## Available Test Scripts

### 1. Test Notifications Script

The main script for testing notifications is `test-notifications.js`. It supports multiple testing modes:

```bash
node test-notifications.js [API_KEY] [TYPE]
```

Parameters:
- `API_KEY`: Your Firebase Functions API key
- `TYPE`: Type of notification to test
  - `preview`: Generate email preview without sending (default)
  - `email`: Send only email notification
  - `push`: Send only push notification
  - `both`: Send both email and push notifications
  - `motivation`: Send noon motivation notification

### 2. Email Preview

To preview how the email notification will look without sending it:

```bash
node test-notifications.js
```

This will generate two files:
- `email-preview.html`: HTML version of the email
- `email-preview.txt`: Plain text version of the email

You can view the HTML preview in your browser by opening `view-email.html`.

### 3. Send Test Email

To send a test email notification:

```bash
node test-notifications.js YOUR_API_KEY email
```

### 4. Send Test Push Notification

To send a test push notification:

```bash
node test-notifications.js YOUR_API_KEY push
```

### 5. Send Both Email and Push

To send both email and push notifications:

```bash
node test-notifications.js YOUR_API_KEY both
```

### 6. Send Noon Motivation

To send a noon motivation notification:

```bash
node test-notifications.js YOUR_API_KEY motivation
```

## Troubleshooting

### Unauthorized Error

If you get an "Unauthorized" error, make sure you're using the correct API key. The API key is configured in Firebase Functions config.

### No FCM Tokens Found

If you get a "No FCM tokens found" message, it means there are no registered devices for push notifications. Make sure you've opened the app and allowed notifications on at least one device.

### Email Not Received

If the email notification is sent successfully but not received:
1. Check your spam folder
2. Verify the email address configured in Firebase Functions config
3. Check Firebase logs for any errors

## Email Content

The email notification includes:
- A list of pending tasks due today or overdue
- Due dates for each task (color-coded: red for overdue, orange for today)
- A button to open the FinTask app