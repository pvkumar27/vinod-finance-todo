# Supabase Backups

This directory contains backups of the Supabase database tables.

## Backup Format

Each backup file follows this naming convention:
```
{table_name}_{timestamp}.json
```

For example:
```
credit_cards_2025-07-17T12-00-00-000Z.json
```

## Backup Contents

Each backup file contains a JSON array of records from the corresponding table.

## Restoring Backups

To restore a backup, use the restore script:

```bash
npm run restore .backups/credit_cards_2025-07-17T12-00-00-000Z.json
```

## Automated Backups

Backups are automatically created weekly and stored in this directory on the `backup` branch.

## Manual Backups

You can manually create backups by running:

```bash
npm run backup
```

This requires proper environment variables to be set in a `.env` file.