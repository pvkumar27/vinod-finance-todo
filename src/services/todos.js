import { supabase } from '../supabaseClient';

// Get all todos for the authenticated user
export const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('pinned', { ascending: false })
    .order('sort_order', { ascending: true, nullsLast: true })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Add a new todo
export const addTodo = async (todo) => {
  // Get the highest sort_order value
  const { data: maxOrderData } = await supabase
    .from('todos')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  
  const nextOrder = maxOrderData && maxOrderData.length > 0 && maxOrderData[0].sort_order 
    ? maxOrderData[0].sort_order + 1 
    : 1;
  
  const todoWithOrder = {
    ...todo,
    sort_order: nextOrder
  };
  
  const { data, error } = await supabase
    .from('todos')
    .insert([todoWithOrder])
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

// Update todo order for multiple todos
export const updateTodoOrder = async (todos) => {
  // Process each todo one by one to avoid null task error
  for (let i = 0; i < todos.length; i++) {
    const { error } = await supabase
      .from('todos')
      .update({ sort_order: i + 1 })
      .eq('id', todos[i].id);
    
    if (error) throw error;
  }
};

// Reset todo order to created_at
export const resetTodoOrder = async () => {
  const { error } = await supabase
    .from('todos')
    .update({ sort_order: null })
    .is('id', 'not.null');
  
  if (error) throw error;
};

// Delete a todo
export const deleteTodo = async (id) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};