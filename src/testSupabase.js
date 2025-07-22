import { createClient } from '@supabase/supabase-js';

// Test direct connection to Supabase
const testSupabaseConnection = async () => {
  try {
    // Create a new client with the anon key
    const supabaseUrl = 'https://umkvwtymbchcnfahvrcp.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3Z3dHltYmNoY25mYWh2cmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDQwNDksImV4cCI6MjA2Nzg4MDA0OX0.Nt0VPJv9oJqEGI0Ly-OwcLOjmj6wSMjRQzOBRDpRrjw';
    
    console.log('Creating Supabase client with:');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test a simple query
    const { data, error } = await supabase.from('todos').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful:', data);
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
};

// Export the test function
export default testSupabaseConnection;