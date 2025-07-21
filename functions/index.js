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
    if (apiKey !== functions.config().app.key) {
      console.error('Unauthorized request to sendDailyTaskReminders');
      return res.status(401).send('Unauthorized');
    }

    // Check if push notifications should be sent
    const sendPush = req.query.sendPush === 'true';

    // Get current date range (today)
    // Use Central Time (America/Chicago) for consistency with the 8:00 AM CT schedule
    const now = new Date();
    // Convert to CT (UTC-6 or UTC-5 depending on DST)
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    console.log('Current time (CT):', centralTime.toISOString());

    const startOfDay = new Date(centralTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(centralTime);
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

    console.log(
      `Searching for tasks between ${startTimestamp.toDate().toISOString()} and ${endTimestamp.toDate().toISOString()}`
    );

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

    // Send push notification using FCM if requested or by default
    if (sendPush !== false) {
      await sendPushNotification(tasks.length, tasks);
    }

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
  const emailTo = functions.config().app.email || 'user@example.com';
  console.log(`Sending email notification to: ${emailTo}`);
  await db.collection('mail').add({
    to: emailTo,
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
 * @param {Array} tasks - Optional array of task objects
 */
async function sendPushNotification(taskCount, tasks = []) {
  try {
    const db = admin.firestore();

    // Get all device tokens from Firestore
    const tokenSnapshot = await db.collection('userTokens').get();

    if (tokenSnapshot.empty) {
      console.log('No FCM tokens found');
      return;
    }

    // Get task names for notification body
    let notificationBody = `You have ${taskCount} pending task(s) for today.`;

    // Add task names if available (limit to 3)
    if (tasks && tasks.length > 0) {
      const taskNames = tasks.slice(0, 3).map(task => task.title);
      if (taskNames.length === 1) {
        notificationBody = `Task due today: ${taskNames[0]}`;
      } else if (taskNames.length === 2) {
        notificationBody = `Tasks due today: ${taskNames[0]} and ${taskNames[1]}`;
      } else if (taskNames.length === 3) {
        notificationBody = `Tasks due today: ${taskNames[0]}, ${taskNames[1]}, and more...`;
      }
    }

    // Send to all registered devices
    const sendPromises = tokenSnapshot.docs.map(async doc => {
      const tokenData = doc.data();
      const token = tokenData.token;
      const deviceType = tokenData.deviceType || 'android';

      if (!token) {
        console.log('Invalid token data:', tokenData);
        return;
      }

      // Create notification message
      const message = {
        notification: {
          title: '🔔 FinTask Daily Reminder',
          body: notificationBody,
        },
        data: {
          type: 'daily_reminder',
          taskCount: String(taskCount),
          timestamp: String(Date.now()),
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
              'content-available': 1,
            },
          },
          fcmOptions: {
            imageUrl: 'https://finance-to-dos.web.app/icons/official-logo.png',
          },
        };
      } else {
        message.android = {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'task_reminders',
            icon: 'notification_icon',
            color: '#4285F4',
          },
        };
      }

      try {
        // Send the notification
        await admin.messaging().send(message);
        console.log(`Push notification sent to ${deviceType} device`);
        return true;
      } catch (sendError) {
        console.error(`Error sending to token ${token}:`, sendError);

        // If the token is invalid, remove it
        if (
          sendError.code === 'messaging/invalid-registration-token' ||
          sendError.code === 'messaging/registration-token-not-registered'
        ) {
          await db.collection('userTokens').doc(doc.id).delete();
          console.log(`Removed invalid token: ${token}`);
        }
        return false;
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(Boolean).length;
    console.log(`Push notifications sent to ${successCount}/${tokenSnapshot.size} devices`);
  } catch (error) {
    console.error('Error in push notification process:', error);
  }
}
