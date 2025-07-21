/**
 * Script to check all collections in the database
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkCollections() {
  try {
    console.log('Checking all collections in the database...');
    
    const db = admin.firestore();
    
    // Get all collections
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      return;
    }
    
    console.log(`Found ${collections.length} collections in the database:`);
    
    // Check each collection
    for (const collection of collections) {
      const collectionName = collection.id;
      console.log(`\nCollection: ${collectionName}`);
      
      // Get the first document in the collection
      const snapshot = await db.collection(collectionName).limit(1).get();
      
      if (snapshot.empty) {
        console.log('  No documents found in this collection.');
        continue;
      }
      
      // Get the document data
      const docData = snapshot.docs[0].data();
      
      // Print the document fields
      console.log('  Document fields:');
      Object.keys(docData).forEach(key => {
        const value = docData[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`    ${key}: [Object]`);
        } else {
          console.log(`    ${key}: ${value}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
}

checkCollections().then(() => {
  console.log('\nDone checking collections');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});