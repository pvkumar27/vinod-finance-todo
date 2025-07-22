import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM',
  authDomain: 'finance-to-dos.firebaseapp.com',
  projectId: 'finance-to-dos',
  storageBucket: 'finance-to-dos.firebasestorage.app',
  messagingSenderId: '632129585549',
  appId: '1:632129585549:web:03f68c20f7e023ce067dc4',
  measurementId: 'G-LGG1PX79MB',
};

// Get Firestore instance
let db = null;
try {
  // Try to get existing app
  const app = initializeApp(firebaseConfig, 'firestore-app');
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firestore:', error);
}

export { db };