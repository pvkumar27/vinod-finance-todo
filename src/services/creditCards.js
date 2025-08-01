import { supabase } from '../supabaseClient';

// Get all credit cards for the authenticated user
export const getCreditCards = async () => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Add a new credit card
export const addCreditCard = async cardData => {
  const cardWithDefaults = {
    ...cardData,
    owner: cardData.owner || 'self',
    sync_source: cardData.sync_source || 'Manual',
    autopay: cardData.autopay || false,
    promo_apr: cardData.promo_apr || false,
  };

  const { data, error } = await supabase.from('credit_cards').insert([cardWithDefaults]).select();

  if (error) throw error;
  return data[0];
};

// Update a credit card
export const updateCreditCard = async (id, updates) => {
  const { data, error } = await supabase.from('credit_cards').update(updates).eq('id', id).select();

  if (error) throw error;
  return data[0];
};

// Delete a credit card
export const deleteCreditCard = async id => {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id);

  if (error) throw error;
};

// Sync credit cards from Plaid
export const syncPlaidCreditCards = async plaidData => {
  const { convertPlaidAccountToCreditCard } = await import('./plaid');

  const creditCards = plaidData.accounts
    .filter(account => account.type === 'credit')
    .map(account => convertPlaidAccountToCreditCard(account, plaidData.institution?.name));

  if (creditCards.length === 0) return [];

  const { data, error } = await supabase.from('credit_cards').insert(creditCards).select();

  if (error) throw error;
  return data;
};
