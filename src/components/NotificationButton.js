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
        setTimeout(() => setShowIOSHelp(false), 10000); // Show for 10 seconds
        return;
      }
      
      setNotificationStatus('requesting');
      
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === 'granted') {
        registerDevice();
        // Show confirmation message
        setShowConfirmation(true);
        // Hide confirmation after 3 seconds
        setTimeout(() => setShowConfirmation(false), 3000);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationStatus('error');
    }
  };

  const registerDevice = async () => {
    try {
      if (isDevelopment) {
        console.log('Development mode: Skipping actual token registration');
        return;
      }
      
      // Use existing messaging if available, or initialize a new one
      const messaging = existingMessaging || getMessaging();
      const currentToken = await getToken(messaging, {
        vapidKey: 'BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug'
      });

      if (currentToken) {
        console.log('Device token:', currentToken);
        
        // Import and use the saveUserToken function
        const { saveUserToken } = await import('../utils/tokenStorage');
        const success = await saveUserToken(currentToken);
        
        if (success) {
          console.log('Token saved successfully to Firestore');
        } else {
          console.error('Failed to save token to Firestore');
        }
      } else {
        console.log('No registration token available');
      }
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const getButtonText = () => {
    switch (notificationStatus) {
      case 'checking':
        return 'Checking notifications...';
      case 'unsupported':
        return 'Notifications not supported';
      case 'denied':
        return 'Enable notifications';
      case 'granted':
        return 'Notifications enabled';
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
    return ['checking', 'requesting', 'granted', 'unsupported', 'error'].includes(notificationStatus);
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
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-md z-20 animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">iOS Notification Setup</h3>
              <div className="mt-1 text-xs text-blue-700">
                <p>To enable notifications on iOS:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>Close this browser window</li>
                  <li>Open Safari and go to this website</li>
                  <li>Tap Share icon (box with arrow)</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Open the app from your home screen</li>
                  <li>Try enabling notifications again</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;