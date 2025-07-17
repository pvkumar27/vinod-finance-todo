# Backup Strategy Setup

This document explains how to set up the backup strategy for the FinTask app.

## 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
BACKUP_EMAIL=your_admin_email
BACKUP_PASSWORD=your_admin_password
```

## 2. GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `BACKUP_EMAIL`: Admin email for authentication
   - `BACKUP_PASSWORD`: Admin password for authentication

## 3. Backup Branch

The backup branch has been created. All automated backups will be stored there.

## 4. Manual Backup

To run a manual backup:

```bash
npm run backup
```

## 5. Restore from Backup

To restore data from a backup:

```bash
npm run restore .backups/credit_cards_2025-07-17T12-00-00-000Z.json
```

## 6. Automated Backups

Automated backups are configured to run weekly via GitHub Actions. No further setup is required.