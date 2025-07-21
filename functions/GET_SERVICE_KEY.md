# Getting the Supabase Service Role Key

To complete the setup, you need to get the Supabase Service Role Key from the Supabase dashboard.

## Steps to Get the Service Role Key

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project "umkvwtymbchcnfahvrcp"
3. Go to Project Settings > API
4. In the "Project API keys" section, find the "service_role" key
5. Click "Copy" to copy the key to your clipboard

## Set the Service Role Key in Firebase Functions Config

Once you have the service role key, run the following command:

```bash
firebase functions:config:set supabase.key="YOUR_SERVICE_ROLE_KEY"
```

Replace `YOUR_SERVICE_ROLE_KEY` with the key you copied from the Supabase dashboard.

## Deploy the Updated Function

After setting the key, deploy the updated function:

```bash
firebase deploy --only functions
```

## Test the Function

After deploying, test the function:

```bash
node simple-test.js
```