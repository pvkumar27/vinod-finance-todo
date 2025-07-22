/**
 * HTTP triggered function to clear all FCM tokens
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Function must be exported separately to be used in index.js
exports.clearAllTokens = functions.https.onRequest(async (req, res) => {
  try {
    // Basic auth check - use API key for security
    const apiKey =
      req.query.key || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (apiKey !== functions.config().app.key) {
      console.error('Unauthorized request to clearAllTokens');
      return res.status(401).send('Unauthorized');
    }
    
    const db = admin.firestore();
    
    // Get all tokens
    const tokensSnapshot = await db.collection('userTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found in the database');
      return res.status(200).send('No FCM tokens found in the database');
    }
    
    console.log(`Found ${tokensSnapshot.size} FCM tokens to delete`);
    
    // Delete all tokens
    const batch = db.batch();
    tokensSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${tokensSnapshot.size} FCM tokens`);
    
    return res.status(200).send(`Successfully deleted ${tokensSnapshot.size} FCM tokens. Users will need to re-register their devices.`);
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});