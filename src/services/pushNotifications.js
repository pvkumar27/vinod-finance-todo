/**
 * Web Push Notifications Service for FinTask PWA
 * Handles push notification setup and management for iOS/Android
 */

class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
  }

  /**
   * Check if push notifications are supported
   */
  isNotificationSupported() {
    return this.isSupported && 'Notification' in window;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!this.isNotificationSupported()) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus() {
    if (!this.isNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    if (!this.isSupported) {
      throw new Error('Service Worker or Push Manager not supported');
    }

    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      throw new Error(
        'VAPID public key not configured. Please set REACT_APP_VAPID_PUBLIC_KEY in your .env file.'
      );
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
    });

    this.subscription = subscription;

    // Store subscription in localStorage for persistence
    localStorage.setItem('pushSubscription', JSON.stringify(subscription));

    return subscription;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
      localStorage.removeItem('pushSubscription');
    }
  }

  /**
   * Get existing subscription
   */
  async getSubscription() {
    if (!this.isSupported) return null;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      this.subscription = subscription;
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    }

    return subscription;
  }

  /**
   * Send subscription to your server (placeholder for future implementation)
   */
  async sendSubscriptionToServer(subscription) {
    // For now, just store locally - implement server endpoint later if needed
    return true;
  }

  /**
   * Schedule a local notification (for immediate notifications)
   */
  async showLocalNotification(title, options = {}) {
    if (!this.isNotificationSupported()) return;

    const registration = await navigator.serviceWorker.ready;

    const notificationOptions = {
      body: options.body || '',
      icon: '/icons/official-logo.png',
      badge: '/icons/official-logo.png',
      tag: options.tag || 'fintask-notification',
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      data: options.data || {},
      ...options,
    };

    return registration.showNotification(title, notificationOptions);
  }

  /**
   * Schedule reminder notifications for FinTask (test notification)
   */
  async scheduleFinTaskReminders() {
    // Import NotificationScheduler dynamically to avoid circular dependency
    const { default: NotificationScheduler } = await import('../utils/notificationScheduler');
    const { title, body } = await NotificationScheduler.generateDynamicContent(
      'morning',
      'check-tasks'
    );

    return this.showLocalNotification(title, {
      body,
      tag: 'test-reminder',
      data: { type: 'test' },
    });
  }

  /**
   * Utility function to convert VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get current user ID (implement based on your auth system)
   */
  getCurrentUserId() {
    // Implement based on your Supabase auth
    return localStorage.getItem('userId') || 'anonymous';
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
