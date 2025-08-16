import { useState, useEffect, useCallback } from 'react';
import PushNotificationService from '../services/pushNotifications';

/**
 * Custom hook for managing push notifications in FinTask
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check notification status on mount
  useEffect(() => {
    checkNotificationStatus();
  }, [checkNotificationStatus]);

  const checkNotificationStatus = useCallback(async () => {
    try {
      const currentPermission = PushNotificationService.getPermissionStatus();
      setPermission(currentPermission);

      const subscription = await PushNotificationService.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const granted = await PushNotificationService.requestPermission();
      if (granted) {
        const subscription = await PushNotificationService.subscribe();
        await PushNotificationService.sendSubscriptionToServer(subscription);
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await PushNotificationService.unsubscribe();
      setIsSubscribed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      await PushNotificationService.scheduleFinTaskReminders();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const sendCustomNotification = useCallback(async (title, options) => {
    try {
      await PushNotificationService.showLocalNotification(title, options);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    loading,
    error,
    isSupported: PushNotificationService.isNotificationSupported(),
    requestPermission,
    unsubscribe,
    sendTestNotification,
    sendCustomNotification,
    checkNotificationStatus,
  };
};

export default useNotifications;
