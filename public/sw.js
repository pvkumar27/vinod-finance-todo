/* eslint-disable no-restricted-globals */

// Custom service worker for handling skip waiting and push notifications
self.addEventListener('message', event => {
  // Verify origin for security
  if (event.origin !== self.location.origin) return;

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.delete('icons-cache-v1.8.7'),
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      }),
    ])
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: '📌 FinTask Reminder',
    body: 'You have pending tasks to complete!',
    icon: '/icons/official-logo.png',
    badge: '/icons/official-logo.png',
    tag: 'fintask-reminder',
    requireInteraction: false,
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.log('Push data is not JSON:', event.data.text(), 'Error:', e.message);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Open FinTask',
          icon: '/icons/official-logo.png',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ],
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window/tab, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
