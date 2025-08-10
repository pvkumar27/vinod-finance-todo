import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { Navbar } from './layout';
import { Home } from './pages';
import { supabase } from './supabaseClient';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import AIAssistant from './components/AIAssistant';
import SecureNotification from './components/SecureNotification';
import './App.css';
import './styles/background.css';
import './styles/typography.css';
import './styles/decorative.css';
import './styles/components.css';
import './styles/animations.css';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="App bg-mesh relative">
        <div className="dots-pattern"></div>
        <div className="shape-circle shape-circle-1"></div>
        <div className="shape-circle shape-circle-2"></div>
        <div className="shape-circle shape-circle-3"></div>
        <div className="app-content relative z-10">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-mesh relative">
      <div className="dots-pattern"></div>
      <div className="shape-circle shape-circle-1"></div>
      <div className="shape-circle shape-circle-2"></div>
      <div className="shape-circle shape-circle-3"></div>
      <div className="app-content relative z-10">
        <Navbar session={session} />
        <Home />
      </div>
      <IOSInstallPrompt />
      <AIAssistant />
      <SecureNotification />
    </div>
  );
}

export default App;
