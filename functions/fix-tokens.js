/**
 * Script to fix invalid FCM tokens in the database
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function fixTokens() {
  try {
    console.log('Fixing invalid FCM tokens...');
    
    const db = admin.firestore();
    
    // Get all tokens
    const tokensSnapshot = await db.collection('userTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found in the database');
      return;
    }
    
    console.log(`Found ${tokensSnapshot.size} FCM tokens in the database`);
    
    // Track deleted tokens
    let deletedCount = 0;
    
    // Check each token and delete invalid ones
    for (const doc of tokensSnapshot.docs) {
      const data = doc.data();
      const token = data.token;
      
      if (!token || token.trim() === '') {
        console.log(`Deleting invalid token with ID: ${doc.id}`);
        await db.collection('userTokens').doc(doc.id).delete();
        deletedCount++;
      }
    }
    
    console.log(`\nDeleted ${deletedCount} invalid tokens`);
    
    if (deletedCount > 0) {
      console.log('\nTo register a new token, you need to:');
      console.log('1. Open the app in your browser');
      console.log('2. Allow notifications when prompted');
      console.log('3. The app should automatically register the new token');
    }
    
  } catch (error) {
    console.error('Error fixing tokens:', error);
  }
}

fixTokens().then(() => {
  console.log('Done fixing tokens');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});