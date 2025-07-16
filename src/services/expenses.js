import { supabase } from '../supabaseClient';

// Get all expenses for the authenticated user
export const fetchExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Add a new expense
export const addExpense = async (expenseData) => {
  const expenseWithDefaults = {
    ...expenseData,
    owner: expenseData.owner || 'self',
    sync_source: expenseData.sync_source || 'Manual'
  };
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseWithDefaults])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Update an expense
export const updateExpense = async (id, newData) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(newData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Delete an expense
export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};