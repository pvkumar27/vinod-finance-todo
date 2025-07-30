import { getToken, onMessage } from 'firebase/messaging';
import { signInAnonymously } from 'firebase/auth';
import { messaging, auth } from '../firebase-config';

export const requestNotificationPermission = async () => {
  // Check if we're in a test environment
  if (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in test environment');
    return null;
  }
  
  // Check if basic notifications are supported
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return null;
  }
  
  // If Firebase messaging is not available, fall back to basic notifications
  if (!messaging || !navigator.serviceWorker) {
    console.log('Firebase messaging not available - using basic notifications');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Basic notification permission granted');
      return 'basic-notifications-enabled';
    }
    return null;
  }

  try {
    // First, register service worker if needed
    if ('serviceWorker' in navigator) {
      try {
        // Check if firebase-messaging-sw.js is registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFirebaseMessagingSW = registrations.some(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );

        if (!hasFirebaseMessagingSW) {
          console.log('Registering Firebase messaging service worker...');
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Firebase messaging service worker registered');
        }
      } catch (swError) {
        console.error('Error registering service worker:', swError);
      }
    }

    // Now request permission
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // VAPID key for web push notifications
      const vapidKey =
        process.env.REACT_APP_FIREBASE_VAPID_KEY ||
        process.env.VITE_FIREBASE_VAPID_KEY ||
        'BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug';

      console.log('Using VAPID key:', vapidKey);

      try {
        // Sign in anonymously to Firebase for FCM token
        if (auth) {
          try {
            await signInAnonymously(auth);
            console.log('Signed in anonymously to Firebase');
          } catch (authError) {
            console.log('Anonymous auth failed:', authError.message);
          }
        }
        
        // Special handling for iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
        
        console.log('Device info:', { isIOS, isStandalone });
        
        // For iOS PWA, we need to pass the service worker registration
        const registration = await navigator.serviceWorker.ready;
        console.log('Using service worker registration for FCM token');
        
        // Get token with VAPID key and service worker registration
        const token = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });

        if (token && typeof token === 'string' && token.length > 20) {
          console.log(
            'FCM Token:',
            token.substring(0, 10) + '...' + token.substring(token.length - 5)
          );

          // Send a test notification to verify it's working
          new Notification('FinTask Notifications Enabled', {
            body: 'You will now receive notifications from FinTask!',
            icon: '/icons/official-logo.png',
          });

          return token;
        } else {
          console.log('No valid registration token available.');
          return null;
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        
        // If FCM token fails, still show basic notification support
        console.log('FCM token generation failed, but basic notifications are enabled');
        new Notification('FinTask Notifications Enabled', {
          body: 'Basic notifications are working! (FCM token generation failed)',
          icon: '/icons/official-logo.png',
        });
        
        // Return a placeholder token so the app knows notifications are enabled
        return 'basic-notifications-enabled';
      }
    } else {
      console.log('Unable to get permission to notify:', permission);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while setting up notifications:', error);
    return null;
  }
};

export const setupForegroundMessageListener = () => {
  // Check if we're in a test environment
  if (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in test environment');
    return;
  }
  
  // If Firebase messaging is not available, just log it
  if (!messaging || !navigator.serviceWorker) {
    console.log('Firebase messaging not available - foreground messages will use basic notifications');
    return;
  }

  onMessage(messaging, payload => {
    console.log('Message received in foreground:', payload);

    const title = payload.notification?.title || 'FinTask';
    const body = payload.notification?.body || 'You have a new notification';

    // Show custom toast or alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icons/official-logo.png',
        badge: '/icons/official-logo.png',
        tag: 'fintask-foreground',
      });
    } else {
      // Fallback to alert
      alert(`${title}: ${body}`);
    }
  });
};
