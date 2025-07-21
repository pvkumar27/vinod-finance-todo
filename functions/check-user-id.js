/**
 * Script to check if todos have a userId field
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkUserIdField() {
  try {
    console.log('Checking if todos have a userId field...');
    
    const db = admin.firestore();
    
    // Get all todos
    const todosSnapshot = await db.collection('todos').get();
    
    if (todosSnapshot.empty) {
      console.log('No todos found in the database');
      return;
    }
    
    console.log(`Found ${todosSnapshot.size} todos in the database`);
    
    // Check each todo for userId field
    let hasUserIdCount = 0;
    let missingUserIdCount = 0;
    
    todosSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        hasUserIdCount++;
        console.log(`Todo ${doc.id} has userId: ${data.userId}`);
      } else {
        missingUserIdCount++;
        console.log(`Todo ${doc.id} is missing userId field`);
      }
    });
    
    console.log('\nSummary:');
    console.log(`  Todos with userId: ${hasUserIdCount}`);
    console.log(`  Todos missing userId: ${missingUserIdCount}`);
    
    if (missingUserIdCount > 0) {
      console.log('\nTo add userId field to all todos:');
      console.log('node add-user-id.js');
    }
    
  } catch (error) {
    console.error('Error checking userId field:', error);
  }
}

checkUserIdField().then(() => {
  console.log('\nDone checking userId field');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});