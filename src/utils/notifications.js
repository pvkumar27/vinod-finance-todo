import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase-config';

export const requestNotificationPermission = async () => {
  // Check if we're in a test environment or if the browser supports notifications
  if (
    !messaging ||
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !navigator.serviceWorker ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in this environment');
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
        const token = await getToken(messaging, {
          vapidKey: vapidKey,
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
        return null;
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
  // Check if we're in a test environment or if the browser supports notifications
  if (
    !messaging ||
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !navigator.serviceWorker ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in this environment');
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
