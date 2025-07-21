/**
 * Script to add test tasks with different due dates
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function addTestTasks() {
  try {
    console.log('Adding test tasks with different due dates...');
    
    const db = admin.firestore();
    
    // Create dates for testing
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Create test tasks
    const tasks = [
      {
        task: 'Test_E2E_Today Task',
        dueDate: admin.firestore.Timestamp.fromDate(today),
        completed: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        pinned: false
      },
      {
        task: 'Test_E2E_Yesterday Task',
        dueDate: admin.firestore.Timestamp.fromDate(yesterday),
        completed: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        pinned: false
      },
      {
        task: 'Test_E2E_Last Week Task',
        dueDate: admin.firestore.Timestamp.fromDate(lastWeek),
        completed: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        pinned: false
      }
    ];
    
    // Add tasks to the database
    for (const task of tasks) {
      await db.collection('todos').add(task);
      console.log(`Added task: ${task.task} (Due: ${task.dueDate.toDate().toLocaleDateString()})`);
    }
    
    console.log('\nTest tasks added successfully!');
    console.log('To test the notification function, run:');
    console.log('node test-notification.js');
    
  } catch (error) {
    console.error('Error adding test tasks:', error);
  }
}

addTestTasks().then(() => {
  console.log('Done adding test tasks');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});