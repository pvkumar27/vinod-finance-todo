const { schedule } = require('@netlify/functions');

// Send both email and push notifications at 9AM Central
const sendScheduledNotifications = async () => {
  try {
    // Send email reminders (full task list)
    const emailResponse = await fetch(
      'https://fintask.netlify.app/.netlify/functions/send-daily-reminders?key=fintask_notify_2025_secure_key_v1',
      {
        method: 'POST',
      }
    );
    const emailResult = await emailResponse.text();
    console.log('Email notification result:', emailResult);

    // Send push notifications (task count only)
    const pushResponse = await fetch(
      'https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=fintask_notify_2025_secure_key_v1',
      {
        method: 'POST',
      }
    );
    const pushResult = await pushResponse.text();
    console.log('Push notification result:', pushResult);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Daily notifications sent at 9AM Central',
        email: emailResult,
        push: pushResult,
      }),
    };
  } catch (error) {
    console.error('Scheduled notification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Schedule for 9AM Central (14 UTC) daily - both email and push
exports.handler = schedule('0 14 * * *', sendScheduledNotifications);
