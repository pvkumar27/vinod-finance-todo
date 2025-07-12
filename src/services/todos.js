import { supabase } from '../supabaseClient';

// Get all todos for the authenticated user
export const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Add a new todo
export const addTodo = async (todo) => {
  const { data, error } = await supabase
    .from('todos')
    .insert([todo])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Update a todo
export const updateTodo = async (id, updates) => {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Delete a todo
export const deleteTodo = async (id) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};