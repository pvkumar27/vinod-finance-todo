/**
 * Helper functions for handling browser permissions
 */

/**
 * Shows a secure notification using custom event instead of alert()
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
const showSecureNotification = (title, message) => {
  // Dispatch custom event that can be handled by React components
  const event = new CustomEvent('showPermissionNotification', {
    detail: { title, message },
  });
  window.dispatchEvent(event);
};

/**
 * Opens browser settings for the specific browser
 * @returns {boolean} Whether the function was able to open settings
 */
export const openBrowserPermissionSettings = () => {
  const browser = detectBrowser();

  try {
    switch (browser) {
      case 'chrome':
        window.open('chrome://settings/content/notifications', '_blank');
        return true;
      case 'firefox':
        window.open('about:preferences#privacy', '_blank');
        return true;
      case 'edge':
        window.open('edge://settings/content/notifications', '_blank');
        return true;
      case 'safari':
        showSecureNotification(
          'Safari Settings Required',
          'Go to Safari > Preferences > Websites > Notifications and allow this site.'
        );
        return false;
      default:
        showSecureNotification(
          'Browser Settings Required',
          'Please check your browser settings to enable notifications for this site.'
        );
        return false;
    }
  } catch (error) {
    console.error('Error opening browser settings:', error);
    showSecureNotification(
      'Settings Error',
      'Please manually open your browser settings and enable notifications for this site.'
    );
    return false;
  }
};

/**
 * Detects the current browser
 * @returns {string} Browser name (chrome, firefox, edge, safari, or unknown)
 */
export const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg') === -1) {
    return 'chrome';
  } else if (userAgent.indexOf('firefox') > -1) {
    return 'firefox';
  } else if (userAgent.indexOf('edg') > -1) {
    return 'edge';
  } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  } else {
    return 'unknown';
  }
};

/**
 * Resets notification permission state in the browser
 * This is a workaround as browsers don't allow direct permission reset
 */
export const resetNotificationPermission = async () => {
  try {
    // We can't directly reset permissions, but we can:
    // 1. Check if service worker registration exists
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();

      // 2. Unregister all service workers
      for (const registration of registrations) {
        await registration.unregister();
      }

      // 3. Clear site data (this requires user interaction)
      const browser = detectBrowser();

      if (browser === 'chrome' || browser === 'edge') {
        return openBrowserPermissionSettings();
      } else {
        showSecureNotification(
          'Permission Reset Required',
          'Please clear site data and cookies for this website to reset notification permissions.'
        );
        return false;
      }
    }
  } catch (error) {
    console.error('Error resetting notification permission:', error);
    return false;
  }
};
