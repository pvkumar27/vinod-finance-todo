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
export const addCreditCard = async (cardData) => {
  const cardWithDefaults = {
    ...cardData,
    owner: cardData.owner || 'self',
    sync_source: cardData.sync_source || 'Manual'
  };
  
  const { data, error } = await supabase
    .from('credit_cards')
    .insert([cardWithDefaults])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Update a credit card
export const updateCreditCard = async (id, updates) => {
  const { data, error } = await supabase
    .from('credit_cards')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Delete a credit card
export const deleteCreditCard = async (id) => {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};