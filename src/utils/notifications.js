// Local notification utilities

export const requestNotificationPermission = async () => {
  // Check if we're in a test environment or if the browser supports notifications
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Notifications not supported in this environment');
    return null;
  }

  try {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Send a test notification to verify it's working
      new Notification('FinTask Notifications Enabled', {
        body: 'You will now receive local notifications from FinTask!',
        icon: '/icons/official-logo.png',
      });

      return 'local-notifications-enabled';
    } else {
      console.log('Unable to get permission to notify:', permission);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while setting up notifications:', error);
    return null;
  }
};

export const setupForegroundMessageListener = () => {
  // Placeholder for future implementation
  console.log('Local notification listener setup (placeholder)');
};

// Helper function to show local notifications
export const showLocalNotification = (title, body, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/official-logo.png',
      badge: '/icons/official-logo.png',
      tag: 'fintask-local',
      ...options,
    });
  } else {
    console.log('Notification permission not granted or not supported');
  }
};
