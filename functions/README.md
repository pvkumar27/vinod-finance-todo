# FinTask Notification System

This directory contains Firebase Cloud Functions and utility scripts for the FinTask notification system.

## Quick Start

To fix all notification issues at once:

1. Create a service account file:
   - Follow the instructions in `create-service-account.md`
   - Save the file as `service-account.json` in this directory

2. Run the comprehensive fix script:
   ```bash
   node fix-notifications.js
   ```

This script will:
- Check the todos collection structure
- Fix any issues with the todos collection
- Add a test overdue task if none exist
- Check and fix FCM tokens for push notifications
- Test the notification function

## Individual Scripts

If you prefer to run the steps individually:

### 1. Check Todos Structure
```bash
node check-todos-structure.js
```
Shows the structure of todos in the database and identifies issues.

### 2. Fix Todos Structure
```bash
node fix-todos-structure.js
```
Fixes common issues with todos and adds a test overdue task.

### 3. Check FCM Tokens
```bash
node check-tokens.js
```
Shows the FCM tokens in the database for push notifications.

### 4. Fix FCM Tokens
```bash
node fix-tokens.js
```
Deletes invalid FCM tokens.

### 5. Test Notification
```bash
node test-notification.js
```
Tests the notification function and verifies that it includes all tasks.

## Notification Function

The `sendDailyTaskReminders` function:
- Finds all incomplete tasks due today or earlier
- Sends an email notification with the tasks
- Sends push notifications to registered devices

## Configuration

The function uses these configuration values:
- `app.email`: Email address to send notifications to
- `app.key`: API key for authentication

To update the email address:
```bash
firebase functions:config:set app.email="your-email@example.com"
firebase deploy --only functions
```