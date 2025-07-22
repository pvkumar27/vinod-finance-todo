/**
 * Script to clear all FCM tokens from the database
 */
const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
admin.initializeApp();

async function clearTokens() {
  try {
    console.log('Clearing all FCM tokens from the database...');
    
    const db = admin.firestore();
    
    // Get all tokens
    const tokensSnapshot = await db.collection('userTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found in the database');
      return;
    }
    
    console.log(`Found ${tokensSnapshot.size} FCM tokens to delete`);
    
    // Delete all tokens
    const batch = db.batch();
    tokensSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${tokensSnapshot.size} FCM tokens`);
    
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

clearTokens().then(() => {
  console.log('Done clearing tokens');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});