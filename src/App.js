import React, { useState, useEffect } from 'react';
import { AuthForm } from './components';
import { supabase } from './supabaseClient';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import MainApp from './components/MainApp';
import NotificationScheduler from './utils/notificationScheduler';
import './App.css';
import './styles/globals.css';
import './styles/finbot-theme.css';
import './styles/design-system.css';
import './styles/apple-wallet-theme.css';

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
      // Auto-enable notifications failed
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
          // Failed to initialize notifications
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div className="modern-card scale-in">
          <div className="text-center">
            <div className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
              FinTask
            </div>
            <div className="modern-loading mx-auto mb-4"></div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Loading your AI money assistant...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="relative overflow-hidden min-h-screen"
        style={{ background: 'var(--color-background)' }}
      >
        {/* Modern gradient background */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-32 h-32 rounded-full blur-xl opacity-30"
            style={{ background: 'var(--gradient-primary)' }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 rounded-full blur-xl opacity-20"
            style={{ background: 'var(--gradient-secondary)', animationDelay: '1s' }}
          ></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="fade-in">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden min-h-screen"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Modern ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--gradient-primary)' }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--gradient-accent)', animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative z-10">
        <MainApp />
      </div>
      <IOSInstallPrompt />
    </div>
  );
}

export default App;
