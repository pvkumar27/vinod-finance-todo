import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../utils/notifications';
import { saveUserToken } from '../utils/tokenStorage';
import { openBrowserSettings } from '../utils/permissionUtils';

const NotificationSettings = () => {
  const [notificationStatus, setNotificationStatus] = useState('unchecked');
  const [loading, setLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    setNotificationStatus(Notification.permission);
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        await saveUserToken(token);
        setNotificationStatus('granted');
      } else {
        setNotificationStatus(Notification.permission);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 card-fancy rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>

      {notificationStatus === 'unsupported' && (
        <div className="text-red-500">Push notifications are not supported in your browser.</div>
      )}

      {notificationStatus === 'denied' && (
        <div className="space-y-4">
          <div className="text-yellow-500">
            Notifications are blocked. Please update your browser settings to enable notifications.
          </div>
          <div className="text-sm text-gray-600">
            <p>How to enable notifications:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Click the lock/info icon in the address bar (left of the URL)</li>
              <li>Find "Notifications" in the site settings</li>
              <li>Change from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={openBrowserSettings}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded text-sm"
          >
            Open Browser Settings
          </button>
        </div>
      )}

      {notificationStatus === 'granted' && (
        <div className="space-y-4">
          <div className="text-green-500">Push notifications are enabled!</div>

          <button
            onClick={() => {
              // Send a test notification
              if ('Notification' in window) {
                setTestSent(true);
                new Notification('FinTask Test Notification', {
                  body: 'This is a test notification. If you see this, notifications are working!',
                  icon: '/icons/official-logo.png',
                });

                setTimeout(() => setTestSent(false), 3000);
              }
            }}
            disabled={testSent}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {testSent ? 'Test Sent!' : 'Send Test Notification'}
          </button>
        </div>
      )}

      {(notificationStatus === 'default' || notificationStatus === 'unchecked') && (
        <button
          onClick={handleEnableNotifications}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Enabling...' : 'Enable Push Notifications'}
        </button>
      )}
    </div>
  );
};

export default NotificationSettings;
