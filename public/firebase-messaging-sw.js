/* eslint-disable */
// This file runs in the service worker context, not in the normal JS context
// Use the latest Firebase version
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Log service worker initialization
console.log('Firebase messaging service worker initialized');

// VAPID key for web push notifications
const vapidKey =
  'BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug';

const firebaseConfig = {
  apiKey: 'AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM',
  authDomain: 'finance-to-dos.firebaseapp.com',
  projectId: 'finance-to-dos',
  storageBucket: 'finance-to-dos.firebasestorage.app',
  messagingSenderId: '632129585549',
  appId: '1:632129585549:web:03f68c20f7e023ce067dc4',
  measurementId: 'G-LGG1PX79MB',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'FinTask';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/official-logo.png',
    badge: '/icons/official-logo.png',
    tag: 'fintask-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});
