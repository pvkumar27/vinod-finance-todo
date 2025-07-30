// Test script to manually save FCM token to Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM",
  authDomain: "finance-to-dos.firebaseapp.com",
  projectId: "finance-to-dos",
  storageBucket: "finance-to-dos.firebasestorage.app",
  messagingSenderId: "632129585549",
  appId: "1:632129585549:web:03f68c20f7e023ce067dc4",
  measurementId: "G-LGG1PX79MB"
};

async function saveTestToken() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Create a test token entry
    const testToken = 'test-token-' + Date.now();
    const userId = '370621bf-3d54-4c3f-ae21-97a30062b0f9'; // Your user ID
    
    await setDoc(doc(collection(db, 'userTokens'), `test-${Date.now()}`), {
      token: testToken,
      userId: userId,
      email: 'pvkumar27@gmail.com',
      deviceType: 'ios',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Test token saved to Firestore');
    console.log('Token:', testToken);
    
  } catch (error) {
    console.error('❌ Error saving test token:', error);
  }
}

saveTestToken();