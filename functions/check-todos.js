/**
 * Script to check todos in the database
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
    
    // Group todos by due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('\nTodos by due date:');
    
    todosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nTodo ID: ${doc.id}`);
      console.log(`  Task: ${data.task || data.title || 'MISSING'}`);
      console.log(`  Completed: ${data.completed !== undefined ? data.completed : 'MISSING'}`);
      
      if (data.dueDate) {
        const dueDate = data.dueDate.toDate();
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        
        console.log(`  Due Date: ${dueDate.toISOString()} (${dueDate.toLocaleDateString()})`);
        
        if (dueDateOnly < today) {
          console.log('  Status: OVERDUE');
        } else if (dueDateOnly.getTime() === today.getTime()) {
          console.log('  Status: DUE TODAY');
        } else {
          console.log('  Status: FUTURE');
        }
      } else {
        console.log('  Due Date: MISSING');
      }
    });
    
  } catch (error) {
    console.error('Error checking todos:', error);
  }
}

checkTodos().then(() => {
  console.log('\nDone checking todos');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});