import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { Navbar } from './layout';
import { Home } from './pages';
import { supabase } from './supabaseClient';
import {
  requestNotificationPermission,
  setupForegroundMessageListener,
} from './utils/notifications';
import { saveUserToken } from './utils/tokenStorage';
import { registerMessagingServiceWorker } from './utils/serviceWorkerUtils';
import './App.css';

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

      // Setup push notifications when user logs in
      if (session) {
        initializePushNotifications();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Register Firebase messaging service worker
      await registerMessagingServiceWorker();

      // Request notification permission and get FCM token
      const token = await requestNotificationPermission();

      if (token) {
        console.log('Push notification token obtained:', token);
        // Save token to Firestore
        await saveUserToken(token);
      } else {
        console.warn('Failed to obtain FCM token. Push notifications will not work.');
      }

      // Setup foreground message listener
      setupForegroundMessageListener();
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="App">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar session={session} />
      <Home />
    </div>
  );
}

export default App;
