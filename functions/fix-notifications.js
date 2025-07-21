/**
 * Script to fix notification issues in one go
 * 
 * This script:
 * 1. Checks the todos structure
 * 2. Fixes the todos structure and adds an overdue task
 * 3. Checks and fixes FCM tokens
 * 4. Tests the notification function
 */
const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!');
  console.error('');
  console.error('Please follow the instructions in create-service-account.md to create this file.');
  process.exit(1);
}

// Initialize Firebase Admin with service account
const serviceAccount = require('./service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkTodosStructure() {
  console.log('📋 STEP 1: Checking todos collection structure...');
  
  const db = admin.firestore();
  
  // Get all todos
  const todosSnapshot = await db.collection('todos').get();
  
  if (todosSnapshot.empty) {
    console.log('No todos found in the database');
    return 0;
  }
  
  console.log(`Found ${todosSnapshot.size} todos in the database`);
  
  // Group todos by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let overdueCount = 0;
  let todayCount = 0;
  let futureCount = 0;
  let missingDueDateCount = 0;
  let wrongFieldNameCount = 0;
  
  todosSnapshot.forEach(doc => {
    const data = doc.data();
    
    // Check for wrong field name
    if (!data.dueDate && data.due_date) {
      wrongFieldNameCount++;
    }
    
    const dueDate = data.dueDate?.toDate();
    
    if (dueDate) {
      const dueDateOnly = new Date(dueDate);
      dueDateOnly.setHours(0, 0, 0, 0);
      
      if (dueDateOnly < today) {
        overdueCount++;
      } else if (dueDateOnly.getTime() === today.getTime()) {
        todayCount++;
      } else {
        futureCount++;
      }
    } else {
      missingDueDateCount++;
    }
  });
  
  console.log('\nSummary:');
  console.log(`  Overdue tasks: ${overdueCount}`);
  console.log(`  Today's tasks: ${todayCount}`);
  console.log(`  Future tasks: ${futureCount}`);
  console.log(`  Tasks with missing due date: ${missingDueDateCount}`);
  console.log(`  Tasks with wrong field name (due_date): ${wrongFieldNameCount}`);
  console.log(`  Total tasks: ${todosSnapshot.size}`);
  
  return { overdueCount, todayCount, wrongFieldNameCount };
}

async function fixTodosStructure() {
  console.log('\n📋 STEP 2: Fixing todos collection structure...');
  
  const db = admin.firestore();
  
  // Get all todos
  const todosSnapshot = await db.collection('todos').get();
  
  if (todosSnapshot.empty) {
    console.log('No todos found in the database');
    return;
  }
  
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
      await db.collection('todos').doc(doc.id).update(updates);
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} todos`);
  
  // Add a test overdue task if none exist
  const { overdueCount } = await checkTodosStructure();
  
  if (overdueCount === 0) {
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
  }
}

async function checkAndFixTokens() {
  console.log('\n📋 STEP 3: Checking and fixing FCM tokens...');
  
  const db = admin.firestore();
  
  // Get all tokens
  const tokensSnapshot = await db.collection('userTokens').get();
  
  if (tokensSnapshot.empty) {
    console.log('No FCM tokens found in the database');
    return;
  }
  
  console.log(`Found ${tokensSnapshot.size} FCM tokens in the database`);
  
  // Track deleted tokens
  let deletedCount = 0;
  let validCount = 0;
  
  // Check each token and delete invalid ones
  for (const doc of tokensSnapshot.docs) {
    const data = doc.data();
    const token = data.token;
    
    if (!token || token.trim() === '') {
      await db.collection('userTokens').doc(doc.id).delete();
      deletedCount++;
    } else {
      validCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} invalid tokens`);
  console.log(`Valid tokens remaining: ${validCount}`);
  
  if (validCount === 0) {
    console.log('\n⚠️ No valid FCM tokens found. Push notifications will not work.');
    console.log('To register a new token:');
    console.log('1. Open the app in your browser');
    console.log('2. Allow notifications when prompted');
  }
}

async function testNotification() {
  console.log('\n📋 STEP 4: Testing notification function...');
  
  // Check todos after fixes
  const { overdueCount, todayCount } = await checkTodosStructure();
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

async function runAllSteps() {
  try {
    await checkTodosStructure();
    await fixTodosStructure();
    await checkAndFixTokens();
    const success = await testNotification();
    
    console.log('\n📋 SUMMARY:');
    if (success) {
      console.log('✅ All steps completed successfully!');
      console.log('✅ Notification system is now working correctly with both today\\'s and overdue tasks.');
    } else {
      console.log('⚠️ The notification system is working but may not include all tasks.');
      console.log('⚠️ Check the logs above for more details.');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

runAllSteps().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});