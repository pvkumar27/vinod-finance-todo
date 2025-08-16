import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { supabase } from './supabaseClient';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import MainApp from './components/MainApp';
import NotificationScheduler from './utils/notificationScheduler';
import './App.css';
import './styles/globals.css';
import './styles/finbot-theme.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-enable notifications for PWA
  const autoEnableNotifications = async () => {
    try {
      // Check if running as PWA
      const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

      if (isPWA) {
        const PushNotificationService = (await import('./services/pushNotifications')).default;

        // Only request if not already granted
        if (PushNotificationService.getPermissionStatus() === 'default') {
          const granted = await PushNotificationService.requestPermission();
          if (granted) {
            await PushNotificationService.subscribe();
          }
        }
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Auto-enable notifications failed:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);

      // Initialize notifications when user logs in
      if (session) {
        try {
          await NotificationScheduler.init();
          // Auto-enable notifications for PWA
          await autoEnableNotifications();
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      } else {
        // Cancel notifications when user logs out
        NotificationScheduler.cancelAllNotifications();
      }
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
        {/* FinBot-style background */}
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
      {/* FinBot-style background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl bounce"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl bounce"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative z-10">
        <MainApp />
      </div>
      <IOSInstallPrompt />
      {/* Remove duplicate AI Assistant - it's now in FinBot App */}
    </div>
  );
}

export default App;
