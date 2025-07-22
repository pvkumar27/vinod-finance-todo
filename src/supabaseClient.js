import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://umkvwtymbchcnfahvrcp.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3Z3dHltYmNoY25mYWh2cmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDQwNDksImV4cCI6MjA2Nzg4MDA0OX0.-4qPimfvweAgCEFb8Pw5lxrVqmR1EBZWL3MShJyp14w';
const siteUrl = process.env.REACT_APP_SITE_URL || 'https://fintask.netlify.app';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Key provided ✓' : 'Missing ✗');

// Create client with standard options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;