# FinTask Cloud Functions

This directory contains Firebase Cloud Functions for the FinTask application.

## Functions

### `sendDailyTaskReminders`

An HTTP-triggered function that sends daily task reminders via email and push notifications.

#### Features:
- Proper timezone handling (Central Time)
- Includes both today's tasks and overdue tasks
- Sends email notifications via Firebase Extension: Trigger Email
- Sends push notifications via Firebase Cloud Messaging (FCM)
- API key authentication for security

#### Trigger:
- HTTP request (typically from GitHub Actions scheduled workflow)
- Parameters:
  - `key`: API key for authentication
  - `sendPush`: Whether to send push notifications (default: true)

## Deployment

```bash
# Set configuration values
firebase functions:config:set app.key="YOUR_API_KEY" app.email="user@example.com"

# Deploy functions
firebase deploy --only functions
```

## Testing

```bash
# Test with URL encoded API key
curl -X POST "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY&sendPush=true"
```

## Debugging

Two debugging scripts are included:

1. `check-todos.js` - Lists all todos in the database with their due dates
2. `debug-tasks.js` - Specifically checks for tasks due today with timezone information

To use these scripts:

1. Create a `service-account.json` file with your Firebase service account credentials
2. Run the scripts:
   ```bash
   node check-todos.js
   node debug-tasks.js
   ```