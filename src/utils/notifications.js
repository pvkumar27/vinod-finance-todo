export const requestNotificationPermission = async () => {
  // Check if we're in a test environment
  if (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in test environment');
    return null;
  }
  
  // Check if basic notifications are supported
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return null;
  }
  
  console.log('Using email notifications only - push notifications retired');
  
  // Request permission for basic browser notifications (for immediate feedback)
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Browser notification permission granted');
    
    // Show confirmation that email notifications are active
    new Notification('FinTask Email Notifications Active', {
      body: 'You will receive daily task reminders via email!',
      icon: '/icons/official-logo.png',
    });
    
    return 'email-notifications-enabled';
  }
  
  return null;
};

export const setupForegroundMessageListener = () => {
  // Email notifications only - no foreground message listener needed
  console.log('Email notifications active - no foreground listener needed');
};
