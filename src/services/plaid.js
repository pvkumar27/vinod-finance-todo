import { supabase } from '../supabaseClient';

// Plaid configuration
export const plaidConfig = {
  clientId: process.env.REACT_APP_PLAID_CLIENT_ID,
  secret: process.env.REACT_APP_PLAID_SECRET,
  env: process.env.REACT_APP_PLAID_ENV || 'development',
  products: ['accounts'],
  countryCodes: ['US'],
};

// Create link token - calls backend for real connections in development
export const createLinkToken = async () => {
  if (plaidConfig.env === 'development') {
    // In development, call backend API for real bank connections (free tier)
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      const data = await response.json();
      return data.link_token;
    } catch (error) {
      console.error('Failed to create development link token:', error);
      throw new Error('Unable to connect to bank services. Please try again.');
    }
  } else {
    // Mock link token for sandbox only
    return 'link-sandbox-' + Math.random().toString(36).substr(2, 9);
  }
};

// Store Plaid access token securely in Supabase
export const storePlaidToken = async (accessToken, itemId, institutionId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('plaid_tokens')
    .upsert({
      user_id: user.id,
      access_token: accessToken,
      item_id: itemId,
      institution_id: institutionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) throw error;
  return data[0];
};

// Get stored Plaid tokens for user
export const getPlaidTokens = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('plaid_tokens')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};

// Fetch Plaid accounts - calls backend for real data in development
export const fetchPlaidAccounts = async (accessToken) => {
  if (plaidConfig.env === 'development') {
    // In development, call backend API to fetch real accounts
    try {
      const response = await fetch('/api/plaid/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ access_token: accessToken })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch development accounts:', error);
      throw new Error('Unable to fetch account information. Please try again.');
    }
  } else {
    // Mock response for sandbox only
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          accounts: [
            {
              account_id: 'mock_credit_1',
              name: 'Chase Freedom Unlimited',
              official_name: 'Chase Freedom Unlimited Credit Card',
              type: 'credit',
              subtype: 'credit card',
              mask: '1234',
              institution_name: 'Chase',
              balances: {
                available: 8500,
                current: 1500,
                limit: 10000
              }
            },
            {
              account_id: 'mock_credit_2',
              name: 'Capital One Venture',
              official_name: 'Capital One Venture Rewards Credit Card',
              type: 'credit',
              subtype: 'credit card',
              mask: '5678',
              institution_name: 'Capital One',
              balances: {
                available: 4200,
                current: 800,
                limit: 5000
              }
            }
          ]
        });
      }, 1000);
    });
  }
};

// Convert Plaid account to our credit card format
export const convertPlaidAccountToCreditCard = (account, institutionName) => {
  return {
    card_name: account.name || account.official_name,
    bank_name: institutionName || account.institution_name || 'Unknown Bank',
    is_active: true,
    balance: Math.abs(account.balances?.current || 0),
    last_used_date: null,
    bt_promo_available: false,
    purchase_promo_available: false,
    promo_end_date: null,
    reminder_days_before: 7,
    is_autopay_setup: false,
    notes: `Synced from Plaid • Last 4: ${account.mask || 'N/A'}`,
    owner: 'self',
    sync_source: 'Plaid',
    plaid_account_id: account.account_id
  };
};