/**
 * Register both the main service worker and Firebase messaging service worker
 */
export const registerServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the main service worker
      const mainRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Main service worker registered:', mainRegistration);

      // Register the Firebase messaging service worker
      const firebaseRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('Firebase messaging service worker registered:', firebaseRegistration);

      return { mainRegistration, firebaseRegistration };
    } catch (error) {
      console.error('Error registering service workers:', error);
      return null;
    }
  } else {
    console.warn('Service workers are not supported in this browser');
    return null;
  }
};

/**
 * Check if the Firebase messaging service worker is registered
 * @returns {Promise<boolean>}
 */
export const isFirebaseServiceWorkerRegistered = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.some(
        reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
    } catch (error) {
      console.error('Error checking Firebase service worker:', error);
      return false;
    }
  }
  return false;
};
