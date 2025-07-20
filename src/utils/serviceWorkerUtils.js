/**
 * Utility functions for service worker registration
 */

/**
 * Register the Firebase messaging service worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export const registerMessagingServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the Firebase messaging service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase messaging service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Error registering Firebase messaging service worker:', error);
      return null;
    }
  }
  console.warn('Service workers are not supported in this browser');
  return null;
};
