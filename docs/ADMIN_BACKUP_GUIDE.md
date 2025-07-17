# Admin Backup Guide for GitHub OAuth Users

If you're using GitHub OAuth to log in to Supabase (instead of email/password), use this guide for setting up backups.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with just these variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

The service role key can be found in your Supabase dashboard under Project Settings > API > Service Role Key.

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Add these secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key

### 3. Usage

Run the admin backup script:

```bash
npm run backup:admin
```

This will create backup files in the `.backups/` directory.

### 4. GitHub Actions

Update the GitHub Actions workflow file to use the admin backup script:

```yaml
# In .github/workflows/backup.yml
      - name: Run backup script
        run: node scripts/backup-supabase-admin.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Security Note

The service role key has full admin access to your database. Keep it secure and never expose it in client-side code.