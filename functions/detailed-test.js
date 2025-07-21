/**
 * Script to test the notification function with more detailed logging
 */
const https = require('https');
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
    
    let overdueCount = 0;
    let todayCount = 0;
    let futureCount = 0;
    
    console.log('\nTodos by due date:');
    
    todosSnapshot.forEach(doc => {
      const data = doc.data();
      const dueDate = data.dueDate?.toDate();
      
      if (dueDate) {
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        
        if (dueDateOnly < today) {
          console.log(`  - OVERDUE: ${data.task || data.title} (Due: ${dueDate.toLocaleDateString()})`);
          overdueCount++;
        } else if (dueDateOnly.getTime() === today.getTime()) {
          console.log(`  - TODAY: ${data.task || data.title} (Due: ${dueDate.toLocaleDateString()})`);
          todayCount++;
        } else {
          console.log(`  - FUTURE: ${data.task || data.title} (Due: ${dueDate.toLocaleDateString()})`);
          futureCount++;
        }
      } else {
        console.log(`  - NO DUE DATE: ${data.task || data.title}`);
      }
    });
    
    console.log('\nSummary:');
    console.log(`  Overdue tasks: ${overdueCount}`);
    console.log(`  Today's tasks: ${todayCount}`);
    console.log(`  Future tasks: ${futureCount}`);
    console.log(`  Total tasks: ${todosSnapshot.size}`);
    
    return { overdueCount, todayCount };
  } catch (error) {
    console.error('Error checking todos:', error);
    return { overdueCount: 0, todayCount: 0 };
  }
}

async function testNotification() {
  // First check todos
  const { overdueCount, todayCount } = await checkTodos();
  const expectedTaskCount = overdueCount + todayCount;
  
  // URL encode the API key
  const apiKey = encodeURIComponent('ggUbeLe1auQ5Lb6B2zUR6Ag+XW/7ffOh');
  const url = `https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=${apiKey}&sendPush=true`;
  
  console.log(`\nExpecting ${expectedTaskCount} tasks in the notification (${overdueCount} overdue + ${todayCount} today)`);
  console.log(`Testing notification function with URL: ${url}`);
  
  return new Promise((resolve, reject) => {
    // Make the request
    https.get(url, (res) => {
      let data = '';
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response data:', data);
        
        if (res.statusCode === 200) {
          console.log('\n✅ Success! Check your email at pvkumar27@gmail.com for the notification.');
          
          // Check if the expected number of tasks matches
          if (data.includes(`Sent notifications for ${expectedTaskCount} tasks`)) {
            console.log(`✅ Correct number of tasks (${expectedTaskCount}) included in the notification.`);
            resolve(true);
          } else {
            console.log(`⚠️ Warning: Expected ${expectedTaskCount} tasks, but the response indicates a different number.`);
            resolve(false);
          }
        } else {
          console.log('\n❌ Error: The function returned a non-200 status code.');
          reject(new Error(`HTTP status ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error('Error making request:', err.message);
      reject(err);
    });
  });
}

testNotification().then(() => {
  console.log('\nDone testing notification');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});