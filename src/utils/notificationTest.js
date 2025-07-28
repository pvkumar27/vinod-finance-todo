/**
 * Notification testing utilities for debugging iOS issues
 */

export const testNotificationSupport = () => {
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    notificationSupport: 'Notification' in window,
    serviceWorkerSupport: 'serviceWorker' in navigator,
    currentPermission: typeof Notification !== 'undefined' ? Notification.permission : 'N/A',
    pushManagerSupport: 'PushManager' in window,
    vapidSupport: 'vapidKey' in PushSubscriptionOptions.prototype || false
  };

  console.log('🔍 Notification Support Test Results:', results);
  return results;
};

export const testBasicNotification = async () => {
  try {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('📱 Permission result:', permission);

    if (permission === 'granted') {
      const notification = new Notification('FinTask Test', {
        body: 'This is a test notification from FinTask',
        icon: '/icons/official-logo.png',
        tag: 'test-notification'
      });

      notification.onclick = () => {
        console.log('📱 Test notification clicked');
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);

      return { success: true, permission };
    } else {
      return { success: false, permission, reason: 'Permission denied' };
    }
  } catch (error) {
    console.error('📱 Test notification error:', error);
    return { success: false, error: error.message };
  }
};

export const testServiceWorkerRegistration = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('🔧 Current service worker registrations:', registrations);

    const firebaseRegistration = registrations.find(
      reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
    );

    if (firebaseRegistration) {
      console.log('✅ Firebase messaging service worker found:', firebaseRegistration);
      return { success: true, registration: firebaseRegistration };
    } else {
      console.log('⚠️ Firebase messaging service worker not found');
      return { success: false, reason: 'Firebase SW not registered' };
    }
  } catch (error) {
    console.error('🔧 Service worker test error:', error);
    return { success: false, error: error.message };
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.notificationTest = {
    testSupport: testNotificationSupport,
    testBasic: testBasicNotification,
    testServiceWorker: testServiceWorkerRegistration
  };
}