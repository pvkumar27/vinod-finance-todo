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

    // Send to server for push notifications
    await this.sendSubscriptionToServer(subscription);

    return subscription;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer();
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
   * Send subscription to Supabase for server-side push notifications
   */
  async sendSubscriptionToServer(subscription) {
    try {
      // Import Supabase client
      const { createClient } = await import('../supabaseClient');
      const supabase = createClient.default || createClient;

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('No authenticated user found');
        return false;
      }

      // Store subscription in Supabase
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          endpoint: subscription.endpoint,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        console.error('Error storing subscription:', error);
        return false;
      }

      console.log('Push subscription stored successfully');
      return true;
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      return false;
    }
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
   * Get current user ID from Supabase auth
   */
  async getCurrentUserId() {
    try {
      const { createClient } = await import('../supabaseClient');
      const supabase = createClient.default || createClient;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Remove subscription from server when unsubscribing
   */
  async removeSubscriptionFromServer() {
    try {
      const { createClient } = await import('../supabaseClient');
      const supabase = createClient.default || createClient;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return false;

      const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', user.id);

      if (error) {
        console.error('Error removing subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      return false;
    }
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
