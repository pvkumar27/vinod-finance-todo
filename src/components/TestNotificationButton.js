import React, { useState } from 'react';

const TestNotificationButton = () => {
  const [testResult, setTestResult] = useState('');

  const sendTestNotification = async () => {
    try {
      setTestResult('Sending test notification...');
      
      // Get stored subscription
      const subscription = localStorage.getItem('push_subscription');
      if (!subscription) {
        setTestResult('❌ No push subscription found. Enable notifications first.');
        return;
      }

      const subscriptionData = JSON.parse(subscription);
      setTestResult('✅ Found subscription. Sending test notification...');

      // Send a test notification directly using the browser API
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Show a test notification
        registration.showNotification('🧪 FinTask Test', {
          body: 'This is a test of your daily notifications!',
          icon: '/icons/official-logo.png',
          badge: '/icons/official-logo.png',
          tag: 'test-notification',
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Open App'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });

        setTestResult('✅ Test notification sent!');
      } else {
        setTestResult('❌ Service worker not available');
      }
    } catch (error) {
      setTestResult('❌ Error: ' + error.message);
    }
  };

  const sendDailyReminderTest = async () => {
    try {
      setTestResult('Sending daily reminder test...');
      
      // Simulate daily reminder notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        registration.showNotification('🔔 FinTask Daily Summary', {
          body: 'You have 3 pending tasks due today or overdue.',
          icon: '/icons/official-logo.png',
          badge: '/icons/official-logo.png',
          tag: 'daily-reminder',
          requireInteraction: true,
          data: {
            type: 'daily_reminder',
            taskCount: 3,
            timestamp: Date.now()
          }
        });

        setTestResult('✅ Daily reminder test sent!');
      }
    } catch (error) {
      setTestResult('❌ Error: ' + error.message);
    }
  };

  const sendMotivationTest = async () => {
    try {
      setTestResult('Sending motivation test...');
      
      // Simulate noon motivation notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        registration.showNotification('🌟 FinTask Midday Check-in', {
          body: "You've completed 2 tasks today. Can you complete at least 4 before the day ends?",
          icon: '/icons/official-logo.png',
          badge: '/icons/official-logo.png',
          tag: 'motivation',
          requireInteraction: true,
          data: {
            type: 'motivation',
            completedCount: 2,
            pendingCount: 5,
            timestamp: Date.now()
          }
        });

        setTestResult('✅ Motivation test sent!');
      }
    } catch (error) {
      setTestResult('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-3">Test Notifications</h3>
      
      <div className="space-y-2">
        <button
          onClick={sendTestNotification}
          className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
        >
          🧪 Send Test Notification
        </button>
        
        <button
          onClick={sendDailyReminderTest}
          className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 border border-green-300 rounded hover:bg-green-200 transition-colors"
        >
          🌅 Test Daily Reminder (8 AM)
        </button>
        
        <button
          onClick={sendMotivationTest}
          className="w-full px-3 py-2 text-sm bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 transition-colors"
        >
          🌟 Test Motivation (12 PM)
        </button>
      </div>
      
      {testResult && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default TestNotificationButton;