/**
 * Script to fix the structure of the todos collection
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function fixTodosStructure() {
  try {
    console.log('Fixing todos collection structure...');
    
    const db = admin.firestore();
    
    // Get all todos
    const todosSnapshot = await db.collection('todos').get();
    
    if (todosSnapshot.empty) {
      console.log('No todos found in the database');
      return;
    }
    
    console.log(`Found ${todosSnapshot.size} todos in the database`);
    
    // Track fixed todos
    let fixedCount = 0;
    
    // Fix each todo's structure
    for (const doc of todosSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Fix task field
      if (!data.task && data.title) {
        updates.task = data.title;
        needsUpdate = true;
      }
      
      // Fix due date field
      if (!data.dueDate && data.due_date) {
        // Convert string date to Timestamp
        if (typeof data.due_date === 'string') {
          updates.dueDate = admin.firestore.Timestamp.fromDate(new Date(data.due_date));
          needsUpdate = true;
        }
      }
      
      // Ensure completed field exists
      if (data.completed === undefined) {
        updates.completed = false;
        needsUpdate = true;
      }
      
      // Ensure created_at field exists
      if (!data.created_at) {
        updates.created_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      }
      
      // Ensure updated_at field exists
      if (!data.updated_at) {
        updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      }
      
      // Update the todo if needed
      if (needsUpdate) {
        console.log(`Fixing todo: ${data.task || data.title || doc.id}`);
        await db.collection('todos').doc(doc.id).update(updates);
        fixedCount++;
      }
    }
    
    console.log(`\nFixed ${fixedCount} todos`);
    
    // Add a test overdue task if none exist
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const overdueTaskData = {
      task: 'Test_E2E_Overdue Task',
      dueDate: admin.firestore.Timestamp.fromDate(yesterday),
      completed: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      pinned: false
    };
    
    await db.collection('todos').add(overdueTaskData);
    console.log(`Added overdue test task: ${overdueTaskData.task} (Due: ${yesterday.toLocaleDateString()})`);
    
  } catch (error) {
    console.error('Error fixing todos structure:', error);
  }
}

fixTodosStructure().then(() => {
  console.log('\nDone fixing todos structure');
  console.log('To test the notification function, run:');
  console.log('node test-notification.js');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});