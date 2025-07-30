// Debug script to check what tokens are stored in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM",
  authDomain: "finance-to-dos.firebaseapp.com",
  projectId: "finance-to-dos",
  storageBucket: "finance-to-dos.firebasestorage.app",
  messagingSenderId: "632129585549",
  appId: "1:632129585549:web:03f68c20f7e023ce067dc4",
  measurementId: "G-LGG1PX79MB"
};

async function checkTokens() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Checking tokens in Firestore...');
    
    const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
    
    if (tokensSnapshot.empty) {
      console.log('❌ No tokens found in Firestore');
      return;
    }
    
    console.log(`✅ Found ${tokensSnapshot.size} token(s):`);
    
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📱 Token ID: ${doc.id}`);
      console.log(`   Token: ${data.token}`);
      console.log(`   User ID: ${data.userId}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Device: ${data.deviceType}`);
      console.log(`   Created: ${data.createdAt}`);
      console.log(`   Placeholder: ${data.isPlaceholder || false}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tokens:', error);
  }
}

checkTokens();