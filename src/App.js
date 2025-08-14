import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { Navbar } from './layout';
import { Home } from './pages';
import { supabase } from './supabaseClient';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import AIAssistant from './components/AIAssistantEnhanced';
import './App.css';
import './styles/cleo-theme.css';

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
      <div className="cleo-app min-h-screen flex items-center justify-center">
        <div className="cleo-card p-8">
          <div className="cleo-animate-pulse text-xl font-semibold mb-4">FinTask</div>
          <div className="text-sm text-gray-400">Loading your financial assistant...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="cleo-app relative overflow-hidden">
        {/* Cleo-style background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl cleo-animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl cleo-animate-float"
            style={{ animationDelay: '1s' }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="cleo-app relative overflow-hidden">
      {/* Cleo-style background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl cleo-animate-float"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl cleo-animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl cleo-animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
      <div className="relative z-10">
        <Navbar session={session} />
        <Home />
      </div>
      <IOSInstallPrompt />
      <AIAssistant />
    </div>
  );
}

export default App;
