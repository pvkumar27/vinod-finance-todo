import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Only initialize messaging and analytics if in browser environment
let messaging = null;
let analytics = null;

// Check if we're in a browser environment and not in a test environment
if (typeof window !== 'undefined' && !window.navigator.userAgent.includes('Playwright')) {
  try {
    // Initialize analytics in all browser environments
    analytics = getAnalytics(app);

    // Only initialize messaging if notifications are supported
    if ('Notification' in window && navigator.serviceWorker) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.warn('Firebase services initialization failed:', error);
  }
}

export { messaging, analytics, firebaseConfig };
