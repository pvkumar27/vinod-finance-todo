/* eslint-disable max-len */
/**
 * Firebase Cloud Functions for FinTask
 *
 * This implementation uses:
 * 1. HTTP trigger function
 * 2. Firebase Extension: Trigger Email
 * 3. Firebase Cloud Messaging (FCM)
 * 4. Noon motivation notification
 * 5. Token management functions
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

admin.initializeApp();

// Initialize Supabase client
const initSupabase = () => {
  const supabaseUrl = functions.config().supabase.url;
  const supabaseKey = functions.config().supabase.key;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

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
    // Use both UTC and Central Time to cover all bases
    const now = new Date();
    
    // Get today's date string in YYYY-MM-DD format for both UTC and CT
    const utcDateStr = now.toISOString().split('T')[0]; // e.g., "2025-07-21"
    
    // Convert to CT (Dallas, TX timezone)
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const ctDateStr = centralTime.toISOString().split('T')[0]; // e.g., "2025-07-20"
    
    console.log('Current UTC date:', utcDateStr);
    console.log('Current Dallas, TX date:', ctDateStr);
    
    // Use the beginning of the earlier date and end of the later date to cover both timezones
    const startDate = ctDateStr < utcDateStr ? ctDateStr : utcDateStr;
    const endDate = ctDateStr > utcDateStr ? ctDateStr : utcDateStr;
    
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Using date range from ${startDate} to ${endDate} to find tasks`);

    // Query for incomplete tasks due today or overdue
    const db = admin.firestore();
    
    // First, check if the collection exists
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    console.log('Available collections:', collectionNames);
    
    if (!collectionNames.includes('todos')) {
      console.log('The "todos" collection does not exist');
      return res.status(200).send('The "todos" collection does not exist');
    }
    
    // Get the user ID from the config
    const userId = functions.config().app.user_id || '370621bf-3d54-4c3f-ae21-97a30062b0f9';
    console.log(`Filtering tasks for user: ${userId}`);
    
    // Initialize Supabase client
    const supabase = initSupabase();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return res.status(500).send('Failed to initialize Supabase client');
    }
    
    // Convert timestamps to ISO strings for Supabase
    const endDateISO = endOfDay.toISOString();
    
    // Query Supabase for incomplete tasks due today or earlier
    const { data: tasks, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .lte('due_date', endDateISO)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error querying Supabase:', error);
      return res.status(500).send(`Error: ${error.message}`);
    }
    
    // Create a mock snapshot for compatibility with the rest of the function
    const tasksSnapshot = {
      empty: tasks.length === 0,
      size: tasks.length,
      forEach: (callback) => tasks.forEach(callback),
      docs: tasks.map(task => ({
        id: task.id,
        data: () => task
      }))
    };
      
    console.log(`Searching for tasks due on or before ${endDateISO}`);

    if (tasksSnapshot.empty) {
      console.log('No tasks due today or overdue');
      return res.status(200).send('No tasks due today or overdue');
    }
    
    // Log the found tasks
    console.log(`Found ${tasksSnapshot.size} tasks due today or overdue:`);
    tasksSnapshot.forEach(task => {
      console.log(`- Task '${task.task || task.title}': Due ${task.due_date}`);
    });

    // Collect task information
    const taskItems = tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      // Format the due date correctly
      let dueDate = null;
      if (data.due_date) {
        dueDate = new Date(data.due_date);
      }
      
      return {
        id: doc.id,
        title: data.task || data.title || 'Untitled Task',
        dueDate: dueDate,
      };
    });

    // Send email notification using Trigger Email extension
    await sendEmailNotification(taskItems);

    // Send push notification using FCM if requested or by default
    if (sendPush === true) {
      console.log('Sending push notifications as requested');
      await sendPushNotification(taskItems.length);
    } else {
      console.log('Push notifications not requested, sendPush:', sendPush);
    }

    console.log(`Sent notifications for ${taskItems.length} tasks`);
    return res.status(200).send(`Sent notifications for ${taskItems.length} tasks`);
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

  // Format tasks for email with modern styling
  const taskListHtml = tasks
    .map(task => {
      let dueDateStr = '';
      let dueDateClass = '';
      
      if (task.dueDate) {
        // Format the date as MM/DD/YYYY
        const month = task.dueDate.getMonth() + 1;
        const day = task.dueDate.getDate();
        const year = task.dueDate.getFullYear();
        dueDateStr = `${month}/${day}/${year}`;
        
        // Check if task is overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          dueDateClass = 'color: #e53e3e; font-weight: 600;'; // Red for overdue
        } else if (dueDate.getTime() === today.getTime()) {
          dueDateClass = 'color: #dd6b20; font-weight: 600;'; // Orange for today
        } else {
          dueDateClass = 'color: #718096;'; // Gray for future
        }
      }
      
      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">📌</span>
              <span style="font-weight: 500;">${task.title}</span>
            </div>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; ${dueDateClass}">
            ${dueDateStr ? `Due: ${dueDateStr}` : ''}
          </td>
        </tr>
      `;
    })
    .join('');

  // Create email using the Trigger Email extension with modern styling
  const emailTo = functions.config().app.email || 'user@example.com';
  console.log(`Sending email notification to: ${emailTo}`);
  await db.collection('mail').add({
    to: emailTo,
    message: {
      subject: '📝 Your FinTask To-Dos: Due Today & Overdue',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: #4299e1; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📝 Your Daily Tasks</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; margin-bottom: 24px; color: #4a5568;">
              You have <strong>${tasks.length} pending task${tasks.length !== 1 ? 's' : ''}</strong> that need attention:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f7fafc; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr>
                  <th style="padding: 12px 16px; text-align: left; background-color: #edf2f7; border-bottom: 2px solid #e2e8f0; color: #4a5568; font-size: 14px;">
                    Task
                  </th>
                  <th style="padding: 12px 16px; text-align: right; background-color: #edf2f7; border-bottom: 2px solid #e2e8f0; color: #4a5568; font-size: 14px;">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                ${taskListHtml}
              </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://fintask.netlify.app/" style="display: inline-block; background-color: #4299e1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Open FinTask
              </a>
            </div>
            
            <p style="font-size: 14px; color: #718096; margin-top: 24px; text-align: center;">
              Stay productive and organized with FinTask!
            </p>
          </div>
        </div>
      `,
      text: `Your FinTask To-Dos: Due Today & Overdue\n\nYou have ${tasks.length} pending task(s) that need attention:\n\n${tasks
        .map(task => {
          let dueDateStr = '';
          if (task.dueDate) {
            const month = task.dueDate.getMonth() + 1;
            const day = task.dueDate.getDate();
            const year = task.dueDate.getFullYear();
            dueDateStr = `(Due: ${month}/${day}/${year})`;
          }
          return `- ${task.title} ${dueDateStr}`;
        })
        .join('\n')}\n\nOpen FinTask to manage your tasks: https://fintask.netlify.app/`,
    },
  });

  console.log('Email notification sent');
}

/**
 * HTTP triggered function to send a test push notification
 */
exports.testPushNotification = functions.https.onRequest(async (req, res) => {
  try {
    // Basic auth check - use API key for security
    const apiKey =
      req.query.key || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (apiKey !== functions.config().app.key) {
      console.error('Unauthorized request to testPushNotification');
      return res.status(401).send('Unauthorized');
    }
    
    const db = admin.firestore();
    
    // Get all device tokens from Firestore
    const tokenSnapshot = await db.collection('userTokens').get();

    if (tokenSnapshot.empty) {
      console.log('No FCM tokens found');
      return res.status(200).send('No FCM tokens found');
    }
    
    console.log(`Found ${tokenSnapshot.size} FCM tokens`);
    
    // Send a test notification to each device
    let successCount = 0;
    for (const doc of tokenSnapshot.docs) {
      const data = doc.data();
      const token = data.token;
      const deviceType = data.deviceType || 'unknown';
      const email = data.email || 'unknown';
      const userId = data.userId || 'unknown';
      
      console.log(`Sending to device: ${deviceType}, email: ${email}, userId: ${userId}`);
      
      // Create notification message
      const message = {
        notification: {
          title: '🧪 FinTask Test Notification',
          body: `This is a test notification. Device: ${deviceType}, Email: ${email}`,
        },
        data: {
          type: 'test',
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
              badge: 1,
              'content-available': 1,
            },
          },
          fcmOptions: {
            imageUrl: 'https://fintask.netlify.app/icons/official-logo.png',
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
        await admin.messaging().send(message);
        console.log(`Test notification sent to ${deviceType} device`);
        successCount++;
      } catch (error) {
        console.error(`Error sending to token: ${error.message}`);
        
        // If the token is invalid, remove it
        if (
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered' ||
          error.message.includes('Requested entity was not found')
        ) {
          await doc.ref.delete();
          console.log(`Removed invalid token for ${deviceType} device`);
        }
      }
    }
    
    return res.status(200).send(`Test notifications sent to ${successCount}/${tokenSnapshot.size} devices`);
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * Function to fix FCM token record
 */
exports.fixTokenRecord = functions.https.onRequest(async (req, res) => {
  try {
    // Basic auth check - use API key for security
    const apiKey =
      req.query.key || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (apiKey !== functions.config().app.key) {
      console.error('Unauthorized request to fixTokenRecord');
      return res.status(401).send('Unauthorized');
    }
    
    const db = admin.firestore();
    
    // Find the token record with issues
    const tokenSnapshot = await db.collection('userTokens')
      .where('token', '==', 'etR8K5hDLBBmpOtQVp42rP:APA91bEihJt_E8LkwyRa2CVtwSNFStUZe8x5Ck1rHQzSjcYuvxjeWHHKviQC-fT18TtK9ls-YRa1ctm5RsOOGyKyKVbgo8SpTkbztLHTqF5S9eQ04BzaNhE')
      .get();
    
    if (tokenSnapshot.empty) {
      console.log('Token record not found');
      return res.status(200).send('Token record not found');
    }
    
    // Delete the token record
    const promises = tokenSnapshot.docs.map(doc => {
      console.log(`Deleting token record with ID: ${doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(promises);
    console.log(`Deleted ${promises.length} token record(s)`);
    
    return res.status(200).send(`Deleted ${promises.length} token record(s). Please re-register the device by opening the app and allowing notifications.`);
  } catch (error) {
    console.error('Error fixing token record:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * Send push notification using Firebase Cloud Messaging
 * @param {number} taskCount - Number of tasks
 * @param {Array} tasks - Optional array of task objects
 */
async function sendPushNotification(taskCount) {
  try {
    console.log(`Starting push notification process for ${taskCount} tasks`);
    const db = admin.firestore();

    // Get all device tokens from Firestore
    const tokenSnapshot = await db.collection('userTokens').get();

    if (tokenSnapshot.empty) {
      console.log('❌ No FCM tokens found in Firestore');
      console.log('User needs to enable notifications in the app');
      return;
    }

    console.log(`✅ Found ${tokenSnapshot.size} FCM token(s) in Firestore`);

    // Create a single notification body with task count
    let notificationBody;
    if (taskCount === 1) {
      notificationBody = 'You have 1 pending task due today or overdue.';
    } else {
      notificationBody = `You have ${taskCount} pending tasks due today or overdue.`;
    }

    // Group tokens by user ID
    const tokensByUser = {};
    tokenSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      if (!userId) return;
      
      if (!tokensByUser[userId]) {
        tokensByUser[userId] = [];
      }
      tokensByUser[userId].push({
        token: data.token,
        deviceType: data.deviceType || 'android'
      });
    });

    // Send one notification per user
    const sendPromises = [];
    for (const userId in tokensByUser) {
      const userTokens = tokensByUser[userId];
      
      // Send to each device for this user
      for (const tokenData of userTokens) {
        const { token, deviceType } = tokenData;
        
        if (!token) continue;

        // Create notification message
        const message = {
          notification: {
            title: '🔔 FinTask Daily Summary',
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
              imageUrl: 'https://fintask.netlify.app/icons/official-logo.png',
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

        // Add to promises
        sendPromises.push({
          promise: admin.messaging().send(message),
          token,
          deviceType
        });
      }
    }

    // Wait for all promises to resolve
    let successCount = 0;
    for (const { promise, token, deviceType } of sendPromises) {
      try {
        await promise;
        console.log(`Push notification sent to ${deviceType} device`);
        successCount++;
      } catch (sendError) {
        console.error(`Error sending to token ${token}:`, sendError);

        // If the token is invalid, remove it
        if (
          sendError.code === 'messaging/invalid-registration-token' ||
          sendError.code === 'messaging/registration-token-not-registered' ||
          sendError.message.includes('Requested entity was not found')
        ) {
          // Find and delete the token document
          const tokenDocs = await db.collection('userTokens')
            .where('token', '==', token)
            .limit(1)
            .get();
            
          if (!tokenDocs.empty) {
            await tokenDocs.docs[0].ref.delete();
            console.log(`Removed invalid token: ${token}`);
          }
        }
      }
    }

    console.log(`✅ Push notifications sent to ${successCount}/${sendPromises.length} devices`);
    if (successCount === 0) {
      console.log('❌ No push notifications were successfully sent');
    }
  } catch (error) {
    console.error('Error in push notification process:', error);
  }
}

/**
 * HTTP triggered function that sends noon motivation notifications
 * Can be triggered by a scheduled HTTP request (e.g., from GitHub Actions)
 */
// Note: Additional token management functions can be added here if needed

exports.sendNoonMotivation = functions.https.onRequest(async (req, res) => {
  try {
    // Basic auth check - use API key for security
    const apiKey =
      req.query.key || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]);
    if (apiKey !== functions.config().app.key) {
      console.error('Unauthorized request to sendNoonMotivation');
      return res.status(401).send('Unauthorized');
    }

    // Get the user ID from the config
    const userId = functions.config().app.user_id || '370621bf-3d54-4c3f-ae21-97a30062b0f9';
    console.log(`Sending noon motivation for user: ${userId}`);
    
    // Initialize Supabase client
    const supabase = initSupabase();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return res.status(500).send('Failed to initialize Supabase client');
    }
    
    // Get today's date
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Query Supabase for completed tasks today
    const { data: completedTasks, error: completedError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('updated_at', `${todayStr}T00:00:00.000Z`)
      .lte('updated_at', `${todayStr}T23:59:59.999Z`);
    
    if (completedError) {
      console.error('Error querying completed tasks:', completedError);
      return res.status(500).send(`Error: ${completedError.message}`);
    }
    
    // Query Supabase for pending tasks
    const { data: pendingTasks, error: pendingError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false);
    
    if (pendingError) {
      console.error('Error querying pending tasks:', pendingError);
      return res.status(500).send(`Error: ${pendingError.message}`);
    }
    
    const completedCount = completedTasks?.length || 0;
    const pendingCount = pendingTasks?.length || 0;
    
    console.log(`User has completed ${completedCount} tasks today and has ${pendingCount} pending tasks`);
    
    // Send the motivation notification
    await sendMotivationNotification(completedCount, pendingCount);
    
    return res.status(200).send(`Sent noon motivation notification. Completed: ${completedCount}, Pending: ${pendingCount}`);
  } catch (error) {
    console.error('Error sending noon motivation:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * Send motivation push notification using Firebase Cloud Messaging
 * @param {number} completedCount - Number of tasks completed today
 * @param {number} pendingCount - Number of pending tasks
 */
async function sendMotivationNotification(completedCount, pendingCount) {
  try {
    const db = admin.firestore();

    // Get all device tokens from Firestore
    const tokenSnapshot = await db.collection('userTokens').get();

    if (tokenSnapshot.empty) {
      console.log('No FCM tokens found');
      return;
    }

    // Create a motivational message based on completed tasks
    let title = '🌟 FinTask Midday Check-in';
    let body;
    
    if (completedCount >= 4) {
      body = `Amazing! You've completed ${completedCount} tasks today. Keep up the great work!`;
    } else if (completedCount > 0) {
      body = `You've completed ${completedCount} task${completedCount === 1 ? '' : 's'} today. Can you complete at least 4 before the day ends?`;
    } else {
      body = 'Time to get started! Try to complete at least 4 tasks today. You can do it!';
    }

    // Group tokens by user ID
    const tokensByUser = {};
    tokenSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      if (!userId) return;
      
      if (!tokensByUser[userId]) {
        tokensByUser[userId] = [];
      }
      tokensByUser[userId].push({
        token: data.token,
        deviceType: data.deviceType || 'android'
      });
    });

    // Send one notification per user
    const sendPromises = [];
    for (const userId in tokensByUser) {
      const userTokens = tokensByUser[userId];
      
      // Send to each device for this user
      for (const tokenData of userTokens) {
        const { token, deviceType } = tokenData;
        
        if (!token) continue;

        // Create notification message
        const message = {
          notification: {
            title: title,
            body: body,
          },
          data: {
            type: 'motivation',
            completedCount: String(completedCount),
            pendingCount: String(pendingCount),
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
                badge: pendingCount,
                'content-available': 1,
              },
            },
            fcmOptions: {
              imageUrl: 'https://fintask.netlify.app/icons/official-logo.png',
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

        // Add to promises
        sendPromises.push({
          promise: admin.messaging().send(message),
          token,
          deviceType
        });
      }
    }

    // Wait for all promises to resolve
    let successCount = 0;
    for (const { promise, token, deviceType } of sendPromises) {
      try {
        await promise;
        console.log(`Motivation notification sent to ${deviceType} device`);
        successCount++;
      } catch (sendError) {
        console.error(`Error sending to token ${token}:`, sendError);

        // If the token is invalid, remove it
        if (
          sendError.code === 'messaging/invalid-registration-token' ||
          sendError.code === 'messaging/registration-token-not-registered' ||
          sendError.message.includes('Requested entity was not found')
        ) {
          // Find and delete the token document
          const tokenDocs = await db.collection('userTokens')
            .where('token', '==', token)
            .limit(1)
            .get();
            
          if (!tokenDocs.empty) {
            await tokenDocs.docs[0].ref.delete();
            console.log(`Removed invalid token: ${token}`);
          }
        }
      }
    }

    console.log(`Motivation notifications sent to ${successCount}/${sendPromises.length} devices`);
  } catch (error) {
    console.error('Error in motivation notification process:', error);
  }
}