/**
 * Console error handler for Playwright tests
 * 
 * This helper configures Playwright to ignore specific console errors
 * that are expected in test environments.
 */

/**
 * Configure a page to ignore specific console errors
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
function setupConsoleHandler(page) {
  page.on('console', msg => {
    // List of error patterns to ignore
    const ignoredPatterns = [
      'Load failed',
      'Firebase',
      'Notification',
      'messaging/unsupported-browser',
      'Failed to load resource',
      'Cannot find module',
      'is not defined',
      'Service Worker'
    ];
    
    // Check if this is an error we should ignore
    if (msg.type() === 'error' && 
        ignoredPatterns.some(pattern => msg.text().includes(pattern))) {
      // Silently ignore these errors
      return;
    }
    
    // Log other console messages for debugging
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });
}

module.exports = {
  setupConsoleHandler
};