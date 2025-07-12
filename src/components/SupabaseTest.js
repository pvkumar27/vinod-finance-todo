import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('_test').select('*').limit(1);
        if (error && (error.code === 'PGRST116' || error.message.includes('does not exist'))) {
          setConnectionStatus('✅ Supabase Connected Successfully!');
        } else if (error) {
          setConnectionStatus(`❌ Error: ${error.message}`);
        } else {
          setConnectionStatus('✅ Connected');
        }
      } catch (err) {
        setConnectionStatus(`❌ Connection failed: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Supabase Connection Status:</h3>
      <p className="text-sm">{connectionStatus}</p>
    </div>
  );
};

export default SupabaseTest;