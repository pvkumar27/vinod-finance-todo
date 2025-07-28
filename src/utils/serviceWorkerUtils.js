/**
 * Utility functions for service worker registration and PWA detection
 */

/**
 * Register the Firebase messaging service worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export const registerMessagingServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Check if already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      const existingRegistration = registrations.find(
        reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (existingRegistration) {
        console.log('Firebase messaging service worker already registered:', existingRegistration);
        return existingRegistration;
      }
      
      // Register the Firebase messaging service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
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

/**
 * Check if the device is iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if the app is running as an installed PWA
 * @returns {boolean}
 */
export const isInstalledPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

/**
 * Check if notifications are supported and enabled
 * @returns {string} - 'granted', 'denied', 'default', or 'unsupported'
 */
export const getNotificationStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};
