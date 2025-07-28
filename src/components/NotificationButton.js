import React, { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { messaging as existingMessaging } from '../firebase-config';

// Helper function to detect iOS
const isIOS = () => {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Helper function to detect if running as installed PWA
const isInstalledPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

const NotificationButton = () => {
  const [notificationStatus, setNotificationStatus] = useState('checking');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  // In development mode, just show UI without actual functionality
  const isDevelopment = process.env.NODE_ENV === 'development';

  const checkNotificationPermission = useCallback(async () => {
    try {
      if (isDevelopment) {
        // In development, just simulate the permission check
        setNotificationStatus('default');
        return;
      }
      
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
        return;
      }

      const permission = Notification.permission;
      setNotificationStatus(permission);
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setNotificationStatus('error');
    }
  }, [isDevelopment]);

  useEffect(() => {
    checkNotificationPermission();
  }, [checkNotificationPermission]);

  const requestNotificationPermission = async () => {
    try {
      // Check if iOS and not in standalone mode
      if (isIOS() && !isInstalledPWA()) {
        setShowIOSHelp(true);
        setTimeout(() => setShowIOSHelp(false), 10000);
        return;
      }
      
      setNotificationStatus('requesting');
      
      // If already granted, just test registration
      if (Notification.permission === 'granted') {
        setDebugInfo('Permission already granted, testing registration...');
        await registerDevice();
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
        return;
      }
      
      // Request permission
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setNotificationStatus(permission);
      
      if (permission === 'granted') {
        await registerDevice();
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      } else if (permission === 'denied' && isIOS()) {
        setShowIOSHelp(true);
        setTimeout(() => setShowIOSHelp(false), 15000);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationStatus('error');
    }
  };

  const registerDevice = async () => {
    try {
      setDebugInfo('Starting registration...');
      
      // Only skip in development if not HTTPS
      if (isDevelopment && window.location.protocol !== 'https:') {
        setDebugInfo('Development mode: Skipping actual token registration');
        return true;
      }
      
      // Check if user is authenticated
      const { supabase } = await import('../supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugInfo('❌ User not authenticated');
        return false;
      }
      
      setDebugInfo('✅ User authenticated: ' + user.email);
      
      // Register service worker first if needed
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const hasFirebaseMessagingSW = registrations.some(
            reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
          );

          if (!hasFirebaseMessagingSW) {
            setDebugInfo('Registering service worker...');
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            setDebugInfo('Service worker registered');
          }
        } catch (swError) {
          setDebugInfo('SW Error: ' + swError.message);
        }
      }
      
      // Use existing messaging if available, or initialize a new one
      const messaging = existingMessaging || getMessaging();
      setDebugInfo('Getting FCM token...');
      
      const vapidKey = 'BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug';
      setDebugInfo('Using VAPID key: ' + vapidKey.substring(0, 10) + '...');
      
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        setDebugInfo('Token obtained: ' + currentToken.substring(0, 20) + '...');
        
        // Import and use the saveUserToken function
        const { saveUserToken } = await import('../utils/tokenStorage');
        setDebugInfo('Saving token for user: ' + user.email.substring(0, 10) + '...');
        
        const success = await saveUserToken(currentToken);
        
        if (success) {
          setDebugInfo('✅ Token saved successfully!');
          
          // Show a test notification to confirm it's working
          if (Notification.permission === 'granted') {
            new Notification('FinTask Notifications Enabled', {
              body: 'You will now receive daily task reminders!',
              icon: '/icons/official-logo.png',
              tag: 'fintask-setup'
            });
          }
          
          return true;
        } else {
          setDebugInfo('❌ Failed to save token to Firestore');
          return false;
        }
      } else {
        setDebugInfo('❌ No registration token available');
        return false;
      }
    } catch (error) {
      setDebugInfo('❌ Error: ' + error.message);
      return false;
    }
  };

  const getButtonText = () => {
    switch (notificationStatus) {
      case 'checking':
        return 'Checking notifications...';
      case 'unsupported':
        return 'Notifications not supported';
      case 'denied':
        return 'Try enable notifications';
      case 'granted':
        return 'Test notification registration';
      case 'requesting':
        return 'Requesting permission...';
      case 'default':
        return 'Enable notifications';
      case 'error':
        return 'Error with notifications';
      default:
        return 'Enable notifications';
    }
  };

  const getButtonStyle = () => {
    if (notificationStatus === 'granted') {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (notificationStatus === 'denied') {
      return 'bg-red-100 text-red-800 border-red-300';
    } else if (notificationStatus === 'unsupported' || notificationStatus === 'error') {
      return 'bg-gray-100 text-gray-800 border-gray-300 opacity-50 cursor-not-allowed';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const isButtonDisabled = () => {
    return ['checking', 'requesting', 'unsupported', 'error'].includes(notificationStatus);
  };

  return (
    <div className="relative">
      <button
        onClick={requestNotificationPermission}
        disabled={isButtonDisabled()}
        className={`px-4 py-2 text-sm rounded-lg border ${getButtonStyle()} flex items-center space-x-2 transition-all shadow-sm hover:shadow`}
      >
        <span className="text-base">
          {notificationStatus === 'granted' ? '🔔' : '🔕'}
        </span>
        <span>{getButtonText()}</span>
      </button>
      
      {/* Debug info */}
      {(isDevelopment || debugInfo) && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 z-30">
          <div>Status: {notificationStatus}</div>
          <div>iOS: {isIOS() ? 'Yes' : 'No'}</div>
          <div>PWA: {isInstalledPWA() ? 'Yes' : 'No'}</div>
          <div>Notifications: {'Notification' in window ? 'Supported' : 'Not supported'}</div>
          <div>Permission: {typeof Notification !== 'undefined' ? Notification.permission : 'N/A'}</div>
          {debugInfo && <div className="mt-1 font-bold">{debugInfo}</div>}
        </div>
      )}
      
      {/* Confirmation message */}
      {showConfirmation && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-md z-20 animate-fade-in">
          <div className="flex items-center text-green-700">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Notifications enabled successfully!</span>
          </div>
        </div>
      )}
      
      {/* iOS Help message */}
      {showIOSHelp && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-md z-20 animate-fade-in max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">iOS Notification Setup</h3>
              <div className="mt-1 text-xs text-blue-700">
                {notificationStatus === 'denied' ? (
                  <>
                    <p className="font-medium mb-2 text-red-700">iOS has permanently blocked notifications.</p>
                    <p className="text-xs mb-2">Only solution: Access FinTask from a different URL/domain to reset permissions.</p>
                    <p className="text-xs italic">Contact developer to set up alternative domain for iOS users.</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-2">To enable notifications on iOS:</p>
                    <ol className="list-decimal pl-4 mt-1 space-y-1">
                      <li>Tap the Share button (📤) at the bottom</li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" to install the app</li>
                      <li>Open FinTask from your home screen</li>
                      <li>Try enabling notifications again</li>
                    </ol>
                    <p className="mt-2 text-xs italic">Note: Notifications only work when FinTask is installed as an app on iOS.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;