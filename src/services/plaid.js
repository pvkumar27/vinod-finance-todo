import { supabase } from '../supabaseClient';

// Plaid configuration
export const plaidConfig = {
  clientId: process.env.REACT_APP_PLAID_CLIENT_ID,
  publicKey: process.env.REACT_APP_PLAID_PUBLIC_KEY,
  env: process.env.REACT_APP_PLAID_ENV || 'sandbox',
  products: ['accounts'],
  countryCodes: ['US'],
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

// Mock function to simulate Plaid accounts API call
// In production, this would be handled by a secure backend
export const fetchPlaidAccounts = async (accessToken) => {
  // This is a mock response for development
  // In production, you'd call your backend which calls Plaid API
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