# 🏦 Plaid Production Setup Guide

## Production Requirements

### 1. Plaid Dashboard Setup
1. **Upgrade to Production**: In Plaid Dashboard, request production access
2. **Get Production Credentials**: 
   - New Client ID for production
   - New Secret Key for production
3. **Configure Webhook**: Set webhook URL for account updates

### 2. Backend API Required
Production Plaid requires server-side token handling. You need these API endpoints:

#### `/api/plaid/create-link-token` (POST)
```javascript
// Creates link token for Plaid Link initialization
// Returns: { link_token: "link-production-xxx" }
```

#### `/api/plaid/exchange-token` (POST)
```javascript
// Exchanges public token for access token
// Body: { public_token: "public-sandbox-xxx" }
// Returns: { access_token: "access-production-xxx" }
```

#### `/api/plaid/accounts` (POST)
```javascript
// Fetches account information
// Body: { access_token: "access-production-xxx" }
// Returns: { accounts: [...] }
```

### 3. Environment Variables
Update your production environment:

```env
REACT_APP_PLAID_CLIENT_ID=your_production_client_id
REACT_APP_PLAID_SECRET=your_production_secret
REACT_APP_PLAID_ENV=production
```

### 4. Netlify Environment Variables
Add these in Netlify Dashboard → Site Settings → Environment Variables:
- `REACT_APP_PLAID_CLIENT_ID`
- `REACT_APP_PLAID_SECRET` 
- `REACT_APP_PLAID_ENV=production`

## Current Status

### ✅ Ready for Production
- Environment detection (sandbox vs production)
- Proper error handling
- Secure token storage
- Production API endpoints configured

### ⚠️ Sandbox Mode (Current)
- Uses mock responses for development
- No backend API calls required
- Safe for testing and development

### 🔧 Next Steps for Production
1. Set up backend API endpoints
2. Get production Plaid credentials
3. Update environment variables
4. Deploy and test

## Security Notes
- Never expose Plaid secret in frontend code
- All token exchanges happen on secure backend
- User authentication required for all operations
- Tokens stored with RLS in Supabase