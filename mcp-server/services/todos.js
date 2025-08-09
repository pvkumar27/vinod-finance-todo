import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const getTodos = async (userId, filters = {}) => {
  let query = supabase.from('todos').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  if (filters.completed !== undefined) {
    query = query.eq('completed', filters.completed);
  }
  
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  
  if (filters.due_date) {
    query = query.eq('due_date', filters.due_date);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const addTodo = async (todoData) => {
  const { data, error } = await supabase
    .from('todos')
    .insert([todoData])
    .select();
  
  if (error) throw error;
  return data[0];
};