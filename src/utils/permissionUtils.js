/**
 * Opens browser settings for notifications
 * @returns {boolean} Whether the function was able to open settings
 */
export const openBrowserSettings = () => {
  try {
    // Try to open browser settings based on user agent
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg') === -1) {
      window.open('chrome://settings/content/notifications', '_blank');
      return true;
    } else if (userAgent.indexOf('firefox') > -1) {
      window.open('about:preferences#privacy', '_blank');
      return true;
    } else if (userAgent.indexOf('edg') > -1) {
      window.open('edge://settings/content/notifications', '_blank');
      return true;
    } else {
      alert('Please check your browser settings to enable notifications for this site.');
      return false;
    }
  } catch (error) {
    console.error('Error opening browser settings:', error);
    alert('Please manually enable notifications for this site in your browser settings.');
    return false;
  }
};
