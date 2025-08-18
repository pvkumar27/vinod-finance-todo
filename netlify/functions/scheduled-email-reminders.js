const { schedule } = require('@netlify/functions');

// Send email reminders with full task list at 9AM Central
const sendEmailReminders = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY || 'fintask_notify_2025_secure_key_v1';

    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-daily-reminders?key=${apiKey}`,
      {
        method: 'POST',
      }
    );

    const result = await response.text();
    console.log('Email reminder result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email reminders sent', result }),
    };
  } catch (error) {
    console.error('Email reminder error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Schedule for 9AM Central (14 UTC) daily - email only
exports.handler = schedule('0 14 * * *', sendEmailReminders);
