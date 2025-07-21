/**
 * Debug script to check for tasks due today
 *
 * This script helps diagnose why the sendDailyTaskReminders function
 * isn't finding tasks that are due today.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function debugTasks() {
  try {
    console.log('Debugging tasks due today...');

    // Get current date range (today)
    const now = new Date();
    console.log('Current time:', now.toISOString());
    console.log('Timezone offset:', now.getTimezoneOffset(), 'minutes');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Start of day:', startOfDay.toISOString());
    console.log('End of day:', endOfDay.toISOString());

    const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

    console.log('Start timestamp:', startTimestamp.toDate().toISOString());
    console.log('End timestamp:', endTimestamp.toDate().toISOString());

    // Query for all tasks
    const db = admin.firestore();
    console.log('\n1. Fetching all incomplete tasks:');
    const allTasksSnapshot = await db.collection('todos').where('completed', '==', false).get();

    console.log(`Found ${allTasksSnapshot.size} incomplete tasks`);

    // Log all tasks with their due dates
    console.log('\n2. Incomplete tasks with due dates:');
    allTasksSnapshot.forEach(doc => {
      const data = doc.data();
      const dueDate = data.dueDate ? data.dueDate.toDate().toISOString() : 'No due date';
      console.log(`- Task "${data.title}": Due ${dueDate}`);
    });

    // Query for tasks due today
    console.log('\n3. Querying for tasks due today:');
    const tasksSnapshot = await db
      .collection('todos')
      .where('completed', '==', false)
      .where('dueDate', '>=', startTimestamp)
      .where('dueDate', '<=', endTimestamp)
      .get();

    if (tasksSnapshot.empty) {
      console.log('No tasks found due today with the date range query');
    } else {
      console.log(`Found ${tasksSnapshot.size} tasks due today`);
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- Task "${data.title}": Due ${data.dueDate.toDate().toISOString()}`);
      });
    }

    // Check if there are any tasks with today's date but not matching the query
    console.log("\n4. Checking for tasks with today's date that might not match the query:");
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    let foundManually = false;

    allTasksSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.dueDate) {
        const taskDateStr = data.dueDate.toDate().toISOString().split('T')[0];
        if (taskDateStr === todayStr) {
          console.log(
            `Found task "${data.title}" with today's date: ${data.dueDate.toDate().toISOString()}`
          );
          foundManually = true;
        }
      }
    });

    if (!foundManually) {
      console.log("No tasks found with today's date in manual check");
    }
  } catch (error) {
    console.error('Error debugging tasks:', error);
  }
}

debugTasks()
  .then(() => {
    console.log('\nDebug complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
