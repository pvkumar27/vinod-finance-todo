/**
 * Script to add userId field to all todos
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function addUserIdField() {
  try {
    console.log('Adding userId field to all todos...');
    
    const db = admin.firestore();
    
    // Get all todos
    const todosSnapshot = await db.collection('todos').get();
    
    if (todosSnapshot.empty) {
      console.log('No todos found in the database');
      return;
    }
    
    console.log(`Found ${todosSnapshot.size} todos in the database`);
    
    // Add userId field to each todo
    const userId = 'pvkumar27@gmail.com';
    let updatedCount = 0;
    
    for (const doc of todosSnapshot.docs) {
      const data = doc.data();
      if (!data.userId) {
        await db.collection('todos').doc(doc.id).update({
          userId: userId
        });
        updatedCount++;
      }
    }
    
    console.log(`\nAdded userId field to ${updatedCount} todos`);
    
  } catch (error) {
    console.error('Error adding userId field:', error);
  }
}

addUserIdField().then(() => {
  console.log('\nDone adding userId field');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});