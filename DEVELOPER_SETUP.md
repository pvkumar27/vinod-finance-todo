# FinTask Developer Setup Guide

This guide will help you set up the FinTask PWA development environment from scratch.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Git
- VS Code (recommended)
- Supabase account
- Firebase account (Blaze plan for notifications)
- Plaid developer account (for bank integration)

## Step 1: Clone the Repository

```bash
git clone https://github.com/username/vinod-pwa.git
cd vinod-pwa
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the environment variables in `.env`:
   - Supabase credentials
   - Firebase configuration
   - Plaid API keys

## Step 4: Set Up Supabase

1. Create a new Supabase project
2. Run the SQL setup scripts in this order:
   - `supabase-rls-setup.sql`
   - `supabase-expenses-setup.sql`
   - `supabase-plaid-setup-safe.sql`
   - `supabase-add-completed-column.sql`

## Step 5: Set Up Firebase

1. Create a new Firebase project
2. Enable Cloud Messaging
3. Follow instructions in `FIREBASE_CLI_SETUP.md`
4. Generate VAPID keys for push notifications

## Step 6: Set Up Plaid (Optional)

1. Create a Plaid developer account
2. Set up a new Plaid application
3. Follow instructions in `PLAID-DEVELOPMENT-SETUP.md`

## Step 7: Start Development Server

```bash
npm start
```

## Step 8: Run Tests

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Step 9: Build for Production

```bash
npm run build
```

## Backup and Restore

For backup configuration:
1. Copy the backup environment example:
   ```bash
   cp .env.backup.example .env.backup
   ```
2. Fill in the Supabase service key and admin credentials

To create a backup:
```bash
npm run backup
```

To restore from a backup:
```bash
npm run restore .backups/filename.json
```

## Troubleshooting

### Firebase Push Notifications
If push notifications aren't working:
1. Check Firebase configuration
2. Verify service worker registration
3. Run `npm run test:notification` to test notification delivery

### Supabase Connection Issues
If Supabase connection fails:
1. Verify credentials in `.env`
2. Check Row-Level Security (RLS) policies
3. Run `scripts/fix-supabase-connection.js`

## Additional Resources

- [PWA Project Guidelines](docs/PWA_Project_Guidelines.md)
- [CI/CD Process](docs/CI_CD_PROCESS.md)
- [Backup Guide](docs/BACKUP_GUIDE.md)
- [Release Process](docs/RELEASE_PROCESS.md)