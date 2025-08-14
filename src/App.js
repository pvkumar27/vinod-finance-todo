import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { supabase } from './supabaseClient';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import CleoApp from './components/CleoApp';
import './App.css';
import './styles/fintech-theme.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      // User session established
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8">
          <div className="pulse text-2xl font-bold text-gradient mb-4">FinTask</div>
          <div className="text-sm text-gray-600">Loading your AI money assistant...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app relative overflow-hidden bg-gray-50">
        {/* Real Cleo-style background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl bounce"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl bounce"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="app relative overflow-hidden bg-gray-50">
      {/* Real Cleo-style background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl bounce"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl bounce"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative z-10">
        <CleoApp />
      </div>
      <IOSInstallPrompt />
      {/* Remove duplicate AI Assistant - it's now in CleoApp */}
    </div>
  );
}

export default App;
