import { supabase } from '../supabaseClient';

// Plaid configuration - Development environment only
// Note: "Sandbox 1" key from Plaid dashboard is actually for development environment
export const plaidConfig = {
  clientId: process.env.REACT_APP_PLAID_CLIENT_ID,
  secret: process.env.REACT_APP_PLAID_SECRET,
  env: 'sandbox', // Fixed to sandbox environment only
  products: ['auth'],
  countryCodes: ['US'],
};

// Create link token - calls backend for real bank connections
export const createLinkToken = async () => {
  try {
    const response = await fetch('/.netlify/functions/plaid-create-link-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });
    const data = await response.json();
    return data.link_token;
  } catch (error) {
    console.error('Failed to create link token:', error);
    throw new Error('Unable to connect to bank services. Please try again.');
  }
};

// Store Plaid access token securely in Supabase
export const storePlaidToken = async (accessToken, itemId, institutionId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('plaid_tokens')
    .upsert({
      user_id: user.id,
      access_token: accessToken,
      item_id: itemId,
      institution_id: institutionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data[0];
};

// Get stored Plaid tokens for user
export const getPlaidTokens = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.from('plaid_tokens').select('*').eq('user_id', user.id);

  if (error) throw error;
  return data;
};

// Fetch Plaid accounts - calls backend for real account data
export const fetchPlaidAccounts = async accessToken => {
  try {
    const response = await fetch('/.netlify/functions/plaid-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    throw new Error('Unable to fetch account information. Please try again.');
  }
};

// Convert Plaid account to our credit card format
export const convertPlaidAccountToCreditCard = (account, institutionName) => {
  return {
    bank_name: institutionName || account.institution_name || 'Unknown Bank',
    card_type: account.official_name || account.name || 'Credit Card',
    last4: account.mask || null,
    account_nickname: account.name,
    current_balance: Math.abs(account.balances?.current || 0),
    credit_limit: account.balances?.limit || null,
    sync_source: 'Plaid',
    owner: 'self',
    autopay: false,
    promo_apr: false,
    plaid_account_id: account.account_id,
  };
};
