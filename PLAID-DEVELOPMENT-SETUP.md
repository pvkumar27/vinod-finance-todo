# 🏦 Plaid Development Environment Setup

## Overview
This project uses Plaid's **development environment only** for real bank connections with free tier access.

## Environment Configuration

### 1. Plaid Dashboard Setup
1. Go to [Plaid Dashboard](https://dashboard.plaid.com/)
2. Navigate to **Developers > Keys**
3. Copy the key labeled **"Sandbox 1"** (this is actually for development environment)
4. Copy your **Client ID**

### 2. Environment Variables
Add these to your `.env` file:

```env
# Plaid Configuration (Development Environment Only)
REACT_APP_PLAID_CLIENT_ID=your_client_id_here
REACT_APP_PLAID_SECRET=your_sandbox_1_key_here
REACT_APP_PLAID_ENV=development
```

### 3. Backend API Endpoints Required
You need these endpoints for real bank connections:

#### `/api/plaid/create-link-token` (POST)
Creates link token for Plaid Link initialization

#### `/api/plaid/exchange-token` (POST)
Exchanges public token for access token
- Body: `{ public_token: "public-development-xxx" }`
- Returns: `{ access_token: "access-development-xxx" }`

#### `/api/plaid/accounts` (POST)
Fetches real account information
- Body: `{ access_token: "access-development-xxx" }`
- Returns: `{ accounts: [...] }`

### 4. Netlify Environment Variables
Add these in Netlify Dashboard → Site Settings → Environment Variables:
- `REACT_APP_PLAID_CLIENT_ID`
- `REACT_APP_PLAID_SECRET`
- `REACT_APP_PLAID_ENV=development`

## Features

### ✅ What Works
- Real bank account connections
- Credit card metadata sync
- 🏦 Plaid Synced badges
- Secure token storage in Supabase
- Free tier usage (single user)

### 🔧 Requirements
- Backend API endpoints (required for security)
- Supabase database with plaid_tokens table
- User authentication via Supabase Auth

## Key Notes

1. **"Sandbox 1" Key**: Despite the name, this key is used for development environment
2. **Development Only**: No sandbox or production modes - simplified to one environment
3. **Real Data**: Connects to actual financial institutions
4. **Free Tier**: No cost for personal use with single user limit
5. **Security**: All token exchanges happen on secure backend

## Troubleshooting

- **Button not working**: Check environment variables are set correctly
- **No cards synced**: Verify backend API endpoints are implemented
- **Database errors**: Ensure Supabase migration script was run
- **Token errors**: Confirm "Sandbox 1" key is being used for development