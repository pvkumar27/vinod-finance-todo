import { supabase } from '../supabaseClient';

// Get all todos for the authenticated user
export const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('pinned', { ascending: false })
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

// Update the order of todos
export const updateTodoOrder = async (todos) => {
  // For now, we're just updating the pinned status
  // In a real implementation, you might want to add a 'position' field
  // and update that for each todo
  
  // This is a placeholder implementation
  return todos;
};