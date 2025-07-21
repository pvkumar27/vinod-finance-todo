# FinTask Cloud Functions

This directory contains the Firebase Cloud Functions for the FinTask application.

## Functions

### sendDailyTaskReminders

An HTTP-triggered function that sends daily task reminders via email and push notifications.

#### Features

- Sends email notifications using Firebase Extension: Trigger Email
- Sends push notifications using Firebase Cloud Messaging (FCM)
- Integrates with Supabase to fetch tasks
- Handles timezone differences between UTC and Central Time
- Formats dates in a user-friendly way (MM/DD/YYYY)
- Groups push notifications by user

#### Triggering

The function can be triggered via an HTTP request:

```
https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY&sendPush=true
```

Parameters:
- `key`: API key for authentication (required)
- `sendPush`: Whether to send push notifications (optional, defaults to false)

## Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for instructions on setting up the Supabase integration.

## Testing

Use the `simple-test.js` script to test the function:

```bash
node simple-test.js
```

## Deployment

Deploy the function using the Firebase CLI:

```bash
firebase deploy --only functions
```

## Configuration

The function uses the following configuration values:

- `supabase.url`: Supabase project URL
- `supabase.key`: Supabase service role key
- `app.user_id`: User ID for filtering tasks
- `app.email`: Email address for notifications
- `app.key`: API key for securing the HTTP endpoint

Set these values using the Firebase CLI:

```bash
firebase functions:config:set key=value
```