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
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
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
  
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    
    const title = payload.notification?.title || 'FinTask';
    const body = payload.notification?.body || 'You have a new notification';
    
    // Show custom toast or alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icons/official-logo.png',
        badge: '/icons/official-logo.png',
        tag: 'fintask-foreground'
      });
    } else {
      // Fallback to alert
      alert(`${title}: ${body}`);
    }
  });
};