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
For different environments:

**Development (Free Tier - Real Banks):**
```env
REACT_APP_PLAID_CLIENT_ID=your_development_client_id
REACT_APP_PLAID_SECRET=your_development_secret
REACT_APP_PLAID_ENV=development
```

**Production (Paid Tier):**
```env
REACT_APP_PLAID_CLIENT_ID=your_production_client_id
REACT_APP_PLAID_SECRET=your_production_secret
REACT_APP_PLAID_ENV=production
```

### 4. Netlify Environment Variables
Add these in Netlify Dashboard → Site Settings → Environment Variables:
- `REACT_APP_PLAID_CLIENT_ID`
- `REACT_APP_PLAID_SECRET` 
- `REACT_APP_PLAID_ENV=development` (for free tier with real banks)
- `REACT_APP_PLAID_ENV=production` (for paid tier)

## Current Status

### ✅ Ready for Development/Production
- Environment detection (sandbox vs development vs production)
- Proper error handling
- Secure token storage
- Backend API endpoints configured

### 🆓 Development Mode (Recommended)
- Uses real bank connections (free tier)
- Backend API calls required
- Single user limit
- Perfect for personal use

### ⚠️ Sandbox Mode
- Uses mock responses only
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