/**
 * Register the main service worker (disabled for now)
 */
export const registerServiceWorkers = async () => {
  return null;
};

/**
 * Check if the main service worker is registered
 * @returns {Promise<boolean>}
 */
export const isServiceWorkerRegistered = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.some(reg => reg.active && reg.active.scriptURL.includes('sw.js'));
    } catch (error) {
      console.error('Error checking service worker:', error);
      return false;
    }
  }
  return false;
};
