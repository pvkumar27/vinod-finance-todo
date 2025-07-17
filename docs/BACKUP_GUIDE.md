# Backup Strategy Guide

This document explains how to set up and use the backup strategy for the FinTask app.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
BACKUP_EMAIL=your_admin_email
BACKUP_PASSWORD=your_admin_password
```

### 2. GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `BACKUP_EMAIL`: Admin email for authentication
   - `BACKUP_PASSWORD`: Admin password for authentication

## Usage Instructions

### Manual Backup

To run a manual backup:

```bash
npm run backup
```

This will create backup files in the `.backups/` directory.

### Restore from Backup

To restore data from a backup:

```bash
npm run restore .backups/credit_cards_2025-07-17T12-00-00-000Z.json
```

### Automated Backups

Automated backups run weekly via GitHub Actions and are stored in the `backup` branch.

To manually trigger an automated backup:

1. Go to your repository on GitHub
2. Click on "Actions"
3. Select the "Supabase Backup" workflow
4. Click "Run workflow"

## Backup File Format

Each backup file follows this naming convention:
```
{table_name}_{timestamp}.json
```

For example:
```
credit_cards_2025-07-17T12-00-00-000Z.json
```