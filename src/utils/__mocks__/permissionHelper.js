/**
 * Mock helper functions for handling browser permissions
 */

/**
 * Mock opens browser settings for the specific browser
 * @returns {boolean} Always returns true in tests
 */
export const openBrowserPermissionSettings = () => {
  console.log('Mock: Opening browser permission settings');
  return true;
};

/**
 * Mock detects the current browser
 * @returns {string} Always returns 'chrome' in tests
 */
export const detectBrowser = () => {
  return 'chrome';
};

/**
 * Mock resets notification permission state in the browser
 * @returns {Promise<boolean>} Always returns true in tests
 */
export const resetNotificationPermission = async () => {
  console.log('Mock: Resetting notification permission');
  return true;
};