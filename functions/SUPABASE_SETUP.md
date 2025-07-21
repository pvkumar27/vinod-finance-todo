# Supabase Setup for FinTask Notifications

This document explains how to set up Supabase integration for the FinTask notification system.

## Prerequisites

1. A Supabase project with the FinTask database
2. Firebase project with Cloud Functions enabled
3. Firebase CLI installed and configured

## Setup Steps

### 1. Get Supabase Credentials

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to Project Settings > API
4. Copy the URL and service role key

### 2. Configure Firebase Functions

Set the Supabase URL and key in Firebase Functions config:

```bash
firebase use finance-to-dos
firebase functions:config:set supabase.url="YOUR_SUPABASE_URL"
firebase functions:config:set supabase.key="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

### 3. Set User ID and Email

Set the user ID and email for notifications:

```bash
firebase functions:config:set app.user_id="YOUR_USER_ID"
firebase functions:config:set app.email="YOUR_EMAIL"
```

### 4. Set API Key for Security

Set an API key for securing the HTTP endpoint:

```bash
firebase functions:config:set app.key="YOUR_API_KEY"
```

### 5. Deploy the Function

Deploy the function to Firebase:

```bash
firebase deploy --only functions
```

### 6. Test the Function

Test the function using the simple-test.js script:

```bash
node simple-test.js
```

## Troubleshooting

If you encounter issues:

1. Check the Firebase Functions logs:
   ```bash
   firebase functions:log --only sendDailyTaskReminders
   ```

2. Verify that the Supabase URL and key are correctly set:
   ```bash
   firebase functions:config:get
   ```

3. Ensure that the user ID exists in your Supabase database.

4. Check that the todos table has the correct structure with user_id, due_date, and completed fields.