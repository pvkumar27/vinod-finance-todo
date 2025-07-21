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
      console.log(`- Task "${task.task || task.title}": Due ${task.due_date}`);
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
    if (sendPush !== false) {
      await sendPushNotification(taskItems.length, taskItems);
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

  // Format tasks for email
  const taskListHtml = tasks
    .map(task => {
      let dueDateStr = '';
      if (task.dueDate) {
        // Format the date as MM/DD/YYYY
        const month = task.dueDate.getMonth() + 1;
        const day = task.dueDate.getDate();
        const year = task.dueDate.getFullYear();
        dueDateStr = `(Due: ${month}/${day}/${year})`;
      }
      return `<li>${task.title} ${dueDateStr}</li>`;
    })
    .join('');

  // Create email using the Trigger Email extension
  const emailTo = functions.config().app.email || 'user@example.com';
  console.log(`Sending email notification to: ${emailTo}`);
  await db.collection('mail').add({
    to: emailTo,
    message: {
      subject: '📝 Your FinTask To-Dos: Due Today & Overdue',
      html: `
        <h2>Your FinTask To-Dos: Due Today & Overdue</h2>
        <p>You have ${tasks.length} pending task(s) that need attention:</p>
        <ul>
          ${taskListHtml}
        </ul>
        <p>Open FinTask to manage your tasks.</p>
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

    // Create a single notification body with task count
    let notificationBody;
    if (taskCount === 1) {
      notificationBody = `You have 1 pending task due today or overdue.`;
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
          sendError.code === 'messaging/registration-token-not-registered'
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

    console.log(`Push notifications sent to ${successCount}/${sendPromises.length} devices`);
  } catch (error) {
    console.error('Error in push notification process:', error);
  }
}