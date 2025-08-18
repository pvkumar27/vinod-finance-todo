const { schedule } = require('@netlify/functions');

// Simple scheduled function that calls the existing send-push-reminders function
const sendScheduledNotifications = async () => {
  try {
    const response = await fetch(
      'https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=fintask_notify_2025_secure_key_v1',
      {
        method: 'POST',
      }
    );

    const result = await response.text();
    console.log('Scheduled notification result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Scheduled notification sent', result }),
    };
  } catch (error) {
    console.error('Scheduled notification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Schedule for all 5 notification times: 8AM, 12PM, 4PM, 6PM, 9PM Central
exports.handler = schedule('0 13,17,21,23,2 * * *', sendScheduledNotifications);
