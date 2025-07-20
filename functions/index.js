/**
 * Firebase Cloud Functions for FinTask
 *
 * This implementation uses:
 * 1. HTTP trigger function
 * 2. Firebase Extension: Trigger Email
 * 3. Firebase Cloud Messaging (FCM)
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * HTTP triggered function that sends daily task reminders
 * Can be triggered by a scheduled HTTP request (e.g., from GitHub Actions)
 */
exports.sendDailyTaskReminders = functions.https.onRequest(async (req, res) => {
  try {
    // Basic auth check - use API key for security
    const apiKey =
      req.query.key || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      console.error('Unauthorized request to sendDailyTaskReminders');
      return res.status(401).send('Unauthorized');
    }

    // Get current date range (today)
    const now = admin.firestore.Timestamp.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

    // Query for incomplete tasks due today
    const db = admin.firestore();
    const tasksSnapshot = await db
      .collection('todos')
      .where('completed', '==', false)
      .where('dueDate', '>=', startTimestamp)
      .where('dueDate', '<=', endTimestamp)
      .get();

    if (tasksSnapshot.empty) {
      console.log('No tasks due today');
      return res.status(200).send('No tasks due today');
    }

    // Collect task information
    const tasks = tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Task',
        dueDate: (data.dueDate && data.dueDate.toDate()) || null,
      };
    });

    // Send email notification using Trigger Email extension
    await sendEmailNotification(tasks);

    // Send push notification using FCM
    await sendPushNotification(tasks.length);

    console.log(`Sent notifications for ${tasks.length} tasks`);
    return res.status(200).send(`Sent notifications for ${tasks.length} tasks`);
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * Send email notification using Firebase Extension: Trigger Email
 * @param {Array} tasks - List of tasks
 */
async function sendEmailNotification(tasks) {
  const db = admin.firestore();

  // Format tasks for email
  const taskListHtml = tasks
    .map(task => {
      const dueDate = task.dueDate ? `(Due: ${task.dueDate.toLocaleDateString()})` : '';
      return `<li>${task.title} ${dueDate}</li>`;
    })
    .join('');

  // Create email using the Trigger Email extension
  await db.collection('mail').add({
    to: process.env.NOTIFICATION_EMAIL || 'user@example.com',
    message: {
      subject: '📝 Your FinTask To-Dos for Today',
      html: `
        <h2>Your FinTask To-Dos for Today</h2>
        <p>You have ${tasks.length} pending task(s) for today:</p>
        <ul>
          ${taskListHtml}
        </ul>
        <p>Open FinTask to manage your tasks.</p>
      `,
      text: `Your FinTask To-Dos for Today\n\nYou have ${tasks.length} pending task(s) for today:\n\n${tasks
        .map(
          task =>
            `- ${task.title} ${task.dueDate ? `(Due: ${task.dueDate.toLocaleDateString()})` : ''}`
        )
        .join('\n')}\n\nOpen FinTask to manage your tasks.`,
    },
  });

  console.log('Email notification sent');
}

/**
 * Send push notification using Firebase Cloud Messaging
 * @param {number} taskCount - Number of tasks
 */
async function sendPushNotification(taskCount) {
  try {
    const db = admin.firestore();

    // Get device token from Firestore
    const tokenSnapshot = await db
      .collection('userTokens')
      .limit(1) // Only need one token for the single user
      .get();

    if (tokenSnapshot.empty) {
      console.log('No FCM token found');
      return;
    }

    const token = tokenSnapshot.docs[0].data().token;
    const deviceType = tokenSnapshot.docs[0].data().deviceType || 'android';

    // Create notification message
    const message = {
      notification: {
        title: '🔔 FinTask Reminder',
        body: 'You have pending To-Dos. Open FinTask to view them.',
      },
      token: token,
    };

    // Add platform-specific configurations
    if (deviceType === 'ios') {
      message.apns = {
        payload: {
          aps: {
            sound: 'default',
            badge: taskCount,
          },
        },
      };
    } else {
      message.android = {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'task_reminders',
        },
      };
    }

    // Send the notification
    await admin.messaging().send(message);
    console.log('Push notification sent');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
