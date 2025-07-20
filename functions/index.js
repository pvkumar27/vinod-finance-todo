const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment-timezone');

admin.initializeApp();

/**
 * Helper function to create platform-specific notification payloads
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} taskCount - Number of tasks
 * @param {string} deviceType - 'ios' or 'android'
 * @return {Object} Notification payload
 */
function createNotificationPayload(title, body, taskCount, deviceType) {
  // Common payload for both platforms
  const payload = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      type: 'DAILY_TASKS',
      taskCount: taskCount.toString(),
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // For Flutter apps
    },
  };
  
  // iOS specific configurations
  if (deviceType === 'ios') {
    payload.apns = {
      payload: {
        aps: {
          sound: 'default',
          badge: taskCount,
          content_available: true,
          mutable_content: true,
          category: 'TASK_REMINDER',
        },
      },
      fcm_options: {
        image: 'https://fintask.netlify.app/icons/icon-192x192.png',
      },
    };
  }
  
  // Android specific configurations
  if (deviceType === 'android') {
    payload.android = {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high',
        channel_id: 'task_reminders',
        icon: 'notification_icon',
        color: '#4285F4',
      },
    };
  }
  
  return payload;
}

/**
 * Scheduled function that runs daily at 8:00 AM in each timezone
 * and sends notifications for tasks due within 24 hours
 */
exports.sendDailyTaskNotifications = functions.pubsub
    .schedule('0 8 * * *')
    .timeZone('America/New_York') // Default timezone
    .onRun(async (context) => {
      const db = admin.firestore();
      const messaging = admin.messaging();
      
      // Get all users to process by timezone
      const usersSnapshot = await db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          const userId = userDoc.id;
          const userTimezone = userData.timezone || 'America/New_York';
          
          // Check if it's 8:00 AM in the user's timezone
          const userTime = moment().tz(userTimezone);
          const userHour = userTime.hour();
          
          // Only proceed if it's 8:00 AM (±30 min) in the user's timezone
          if (userHour < 7 || userHour > 8) {
            continue;
          }
          
          // Calculate the time range for tasks due in the next 24 hours
          const now = admin.firestore.Timestamp.now();
          const tomorrow = admin.firestore.Timestamp.fromDate(
              new Date(Date.now() + 24 * 60 * 60 * 1000)
          );
          
          // Query for tasks due in the next 24 hours for this user
          const tasksSnapshot = await db.collection('todos')
              .where('userId', '==', userId)
              .where('dueDate', '>=', now)
              .where('dueDate', '<=', tomorrow)
              .where('completed', '==', false)
              .get();
          
          if (tasksSnapshot.empty) {
            console.log(`No upcoming tasks for user ${userId}`);
            continue;
          }
          
          // Collect task information
          const tasks = tasksSnapshot.docs.map(doc => doc.data().title || 'Untitled Task');
          const taskCount = tasks.length;
          
          // Get the user's FCM tokens (may have multiple devices)
          const tokenSnapshot = await db.collection('userTokens')
              .where('userId', '==', userId)
              .get();
          
          if (tokenSnapshot.empty) {
            console.log(`No FCM tokens found for user ${userId}`);
            continue;
          }
          
          // Get all tokens and device types
          const userDevices = tokenSnapshot.docs.map(doc => ({
            token: doc.data().token,
            deviceType: doc.data().deviceType || 'android', // Default to android if not specified
          }));
          
          // Create notification content
          let notificationTitle = '';
          let notificationBody = '';
          
          if (taskCount === 1) {
            notificationTitle = '1 Task Due Today';
            notificationBody = `"${tasks[0]}" is due in the next 24 hours.`;
          } else {
            notificationTitle = `${taskCount} Tasks Due Today`;
            notificationBody = `You have ${taskCount} tasks due in the next 24 hours.`;
            
            // Add first 3 tasks to the notification
            if (taskCount <= 3) {
              notificationBody += ' ' + tasks.map(t => `"${t}"`).join(', ');
            } else {
              const firstThree = tasks.slice(0, 3).map(t => `"${t}"`).join(', ');
              notificationBody += ` Including ${firstThree}, and ${taskCount - 3} more.`;
            }
          }
          
          // Send notifications to all user devices
          for (const device of userDevices) {
            try {
              // Create platform-specific payload
              const message = createNotificationPayload(
                  notificationTitle,
                  notificationBody,
                  taskCount,
                  device.deviceType
              );
              
              // Add the token to the message
              message.token = device.token;
              
              // Send the notification
              await messaging.send(message);
              console.log(`Notification sent to user ${userId} on ${device.deviceType} device for ${taskCount} tasks`);
            } catch (deviceError) {
              console.error(`Error sending notification to device:`, deviceError);
              
              // Check if token is invalid and remove it
              if (deviceError.code === 'messaging/invalid-registration-token' ||
                  deviceError.code === 'messaging/registration-token-not-registered') {
                console.log(`Removing invalid token for user ${userId}`);
                // Find and delete the token document
                const invalidTokenDocs = await db.collection('userTokens')
                    .where('userId', '==', userId)
                    .where('token', '==', device.token)
                    .get();
                
                for (const doc of invalidTokenDocs.docs) {
                  await doc.ref.delete();
                }
              }
            }
          }
          
        } catch (error) {
          console.error(`Error processing user ${userDoc.id}:`, error);
        }
      }
      
      return null;
    });