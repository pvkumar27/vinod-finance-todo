/**
 * Script to directly check the database for tasks
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkTodos() {
  try {
    console.log('Checking todos in the database...');
    
    const db = admin.firestore();
    
    // Get all todos
    const todosSnapshot = await db.collection('todos').get();
    
    if (todosSnapshot.empty) {
      console.log('No todos found in the database');
      return;
    }
    
    console.log(`Found ${todosSnapshot.size} todos in the database`);
    
    // Log all todos with their due dates
    todosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Todo: ${data.task || data.title || 'Untitled'}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Completed: ${data.completed}`);
      
      if (data.dueDate) {
        const dueDate = data.dueDate.toDate ? data.dueDate.toDate() : new Date(data.dueDate);
        console.log(`  Due Date: ${dueDate.toISOString()} (${dueDate.toLocaleDateString()})`);
      } else if (data.due_date) {
        console.log(`  Due Date: ${data.due_date} (string format)`);
      } else {
        console.log('  No due date');
      }
      
      console.log('  Raw data:', JSON.stringify(data));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking todos:', error);
  }
}

checkTodos().then(() => {
  console.log('Done checking todos');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});