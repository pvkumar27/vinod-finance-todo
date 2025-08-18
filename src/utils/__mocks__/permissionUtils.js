/**
 * Mock opens browser settings for notifications
 * @returns {boolean} Always returns true in tests
 */
export const openBrowserSettings = () => {
  console.log('Mock: Opening browser settings');
  return true;
};
