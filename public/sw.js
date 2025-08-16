/* eslint-disable no-restricted-globals */

// Custom service worker for handling skip waiting
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
