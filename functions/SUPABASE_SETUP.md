# Setting Up Supabase Connection for Notifications

This guide will help you set up the connection between Firebase Cloud Functions and Supabase for the notification system.

## 1. Get Supabase Credentials

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to Project Settings > API
4. Find the following credentials:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Service Role Key**: This is a secret key that starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. Update Firebase Functions Configuration

Run the following commands to set the Supabase configuration:

```bash
firebase functions:config:set supabase.url="YOUR_SUPABASE_URL"
firebase functions:config:set supabase.key="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_SERVICE_ROLE_KEY` with the values from step 1.

## 3. Update the Cloud Function

Run the script to update the Cloud Function to connect to Supabase:

```bash
node fix-supabase-connection.js
```

## 4. Install Dependencies and Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 5. Test the Notification Function

```bash
node simple-test.js
```

## Troubleshooting

If you encounter any issues, check the following:

1. **Table Structure**: Make sure the `todos` table in Supabase has the following fields:
   - `user_email`: The email of the user who owns the task
   - `completed`: A boolean indicating if the task is completed
   - `due_date`: The due date of the task

2. **Permissions**: Make sure the Service Role Key has access to the `todos` table

3. **Logs**: Check the Firebase Functions logs for any errors:
   ```bash
   firebase functions:log
   ```