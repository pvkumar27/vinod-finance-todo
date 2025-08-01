export const requestNotificationPermission = async () => {
  // Check if we're in a test environment
  if (typeof window === 'undefined' || window.navigator.userAgent.includes('Playwright')) {
    console.log('Messaging not supported in test environment');
    return null;
  }

  console.log('Using email notifications only - push notifications retired');

  // Just return success without showing any notifications
  return 'email-notifications-enabled';
};

export const setupForegroundMessageListener = () => {
  // Email notifications only - no foreground message listener needed
  console.log('Email notifications active - no foreground listener needed');
};
