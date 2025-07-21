/**
 * Script to check FCM tokens in the database
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkTokens() {
  try {
    console.log('Checking FCM tokens in the database...');
    
    const db = admin.firestore();
    
    // Get all tokens
    const tokensSnapshot = await db.collection('userTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found in the database');
      return;
    }
    
    console.log(`Found ${tokensSnapshot.size} FCM tokens in the database`);
    
    // Log all tokens
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Token ID: ${doc.id}`);
      console.log(`  Token: ${data.token || 'MISSING'}`);
      console.log(`  Device Type: ${data.deviceType || 'unknown'}`);
      console.log(`  Created: ${data.createdAt ? new Date(data.createdAt).toISOString() : 'unknown'}`);
      console.log('---');
    });
    
    console.log('\nTo fix invalid tokens, run:');
    console.log('node fix-tokens.js');
    
  } catch (error) {
    console.error('Error checking tokens:', error);
  }
}

checkTokens().then(() => {
  console.log('Done checking tokens');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});