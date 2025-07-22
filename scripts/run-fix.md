# Running the Date Fix

To complete the date handling fix, follow these steps:

## 1. Update Supabase Credentials

Edit the `.env` file in the project root and add your Supabase credentials:

```
SUPABASE_URL=https://your-actual-supabase-url.supabase.co
SUPABASE_KEY=your-actual-supabase-service-key
```

## 2. Run the Normalization Script

```bash
cd scripts
node normalize-dates.js
```

This script will:
1. Connect to your Supabase database
2. Fetch all todos
3. Normalize the date format for each todo
4. Update the database with the normalized dates

## 3. Restart the Application

After running the script, restart your application to use the new date handling code:

```bash
npm start
```

## 4. Verify the Fix

Create new tasks with various dates to verify that the dates are displayed correctly:
- Today's date
- Tomorrow's date
- Day after tomorrow
- Month end

All dates should now be displayed in the correct MM/dd format.