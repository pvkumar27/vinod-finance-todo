const { schedule } = require('@netlify/functions');

// Send push notifications with task count at 9AM Central
const sendPushNotifications = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY || 'fintask_notify_2025_secure_key_v1';

    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      {
        method: 'POST',
      }
    );

    const result = await response.text();
    console.log('Push notification result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Push notifications sent', result }),
    };
  } catch (error) {
    console.error('Push notification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Schedule for 9AM Central (14 UTC) daily - push only
exports.handler = schedule('0 14 * * *', sendPushNotifications);
