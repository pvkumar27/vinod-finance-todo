/**
 * Script to check the structure of the todos collection
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkTodosStructure() {
  try {
    console.log('Checking todos collection structure...');
    
    const db = admin.firestore();
    
    // Get all todos
    const todosSnapshot = await db.collection('todos').get();
    
    if (todosSnapshot.empty) {
      console.log('No todos found in the database');
      return;
    }
    
    console.log(`Found ${todosSnapshot.size} todos in the database`);
    
    // Check each todo's structure
    todosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nTodo ID: ${doc.id}`);
      console.log(`  Task: ${data.task || data.title || 'MISSING'}`);
      
      // Check due date field
      if (data.dueDate) {
        console.log(`  Due Date: ${data.dueDate.toDate ? data.dueDate.toDate().toISOString() : 'INVALID FORMAT'}`);
      } else if (data.due_date) {
        console.log(`  Due Date (wrong field name): ${data.due_date}`);
      } else {
        console.log('  Due Date: MISSING');
      }
      
      console.log(`  Completed: ${data.completed !== undefined ? data.completed : 'MISSING'}`);
      console.log(`  Created: ${data.created_at ? data.created_at.toDate().toISOString() : 'MISSING'}`);
      
      // List all fields for inspection
      console.log('  All fields:');
      Object.keys(data).forEach(key => {
        const value = data[key];
        console.log(`    ${key}: ${value instanceof admin.firestore.Timestamp ? value.toDate().toISOString() : value}`);
      });
    });
    
  } catch (error) {
    console.error('Error checking todos structure:', error);
  }
}

checkTodosStructure().then(() => {
  console.log('\nDone checking todos structure');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});