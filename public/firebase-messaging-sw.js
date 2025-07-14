importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM",
  authDomain: "finance-to-dos.firebaseapp.com",
  projectId: "finance-to-dos",
  storageBucket: "finance-to-dos.firebasestorage.app",
  messagingSenderId: "632129585549",
  appId: "1:632129585549:web:03f68c20f7e023ce067dc4",
  measurementId: "G-LGG1PX79MB"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Finance To-Dos';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/official-logo.png',
    badge: '/icons/official-logo.png',
    tag: 'finance-todos-notification',
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
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});