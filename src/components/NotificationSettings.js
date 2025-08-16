import React, { useState, useEffect } from 'react';
import PushNotificationService from '../services/pushNotifications';

const NotificationSettings = () => {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  // Helper functions for UI state
  const getPermissionBadgeClass = permission => {
    if (permission === 'granted') return 'bg-green-100 text-green-800';
    if (permission === 'denied') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPermissionBadgeText = permission => {
    if (permission === 'granted') return '✅ Enabled';
    if (permission === 'denied') return '❌ Blocked';
    return '⏳ Not Set';
  };

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const currentPermission = PushNotificationService.getPermissionStatus();
      setPermission(currentPermission);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await PushNotificationService.requestPermission();
      if (granted) {
        await PushNotificationService.subscribe();

        setPermission('granted');

        // Show welcome notification
        await PushNotificationService.showLocalNotification('🎉 FinTask Notifications Enabled!', {
          body: 'You will now receive reminders for your financial tasks',
          tag: 'welcome-notification',
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert(`Failed to enable notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await PushNotificationService.unsubscribe();
      setPermission('default');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      alert(`Failed to disable notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      // Try native Notification API first (works better in Chrome)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🧪 FinTask Test', {
          body: 'This is a test notification from FinTask!',
          icon: '/icons/official-logo.png',
          tag: 'test-notification',
        });
      } else {
        // Fallback to service worker notification
        await PushNotificationService.showLocalNotification('🧪 Test Notification', {
          body: 'This is a test notification from FinTask!',
          tag: 'test-notification',
          requireInteraction: false,
          data: { type: 'test' },
        });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert(`Test notification failed: ${error.message}`);
    }
  };

  if (!PushNotificationService.isNotificationSupported()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Notifications Not Supported</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📱 Push Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get reminders for your financial tasks and deadlines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionBadgeClass(permission)}`}
          >
            {getPermissionBadgeText(permission)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {permission === 'default' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Enable Notifications for Better Experience
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Get timely reminders for credit card payments, task deadlines, and expense
                  tracking.
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleEnableNotifications}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? '⏳ Enabling...' : '🔔 Enable Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <span className="text-green-500 text-lg mr-2">✅</span>
                <span className="text-sm font-medium text-green-800">
                  Notifications are enabled
                </span>
              </div>
              <button
                onClick={handleTestNotification}
                className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer"
              >
                🧪 Test Notification
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDisableNotifications}
                disabled={loading}
                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '⏳ Disabling...' : '🔕 Disable'}
              </button>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Notifications Blocked</h4>
                <p className="text-sm text-red-700 mt-1">
                  To enable notifications, please allow them in your browser settings:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                  <li>Safari: Settings → FinTask → Notifications</li>
                  <li>Chrome: Site Settings → Notifications → Allow</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">📋 Notification Types</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1 block">💳</span>
            <span className="text-xs text-gray-600">Credit Card Reminders</span>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1 block">✅</span>
            <span className="text-xs text-gray-600">Task Deadlines</span>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl mb-1 block">💰</span>
            <span className="text-xs text-gray-600">Expense Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
