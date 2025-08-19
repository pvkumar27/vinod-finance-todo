const { schedule } = require('@netlify/functions');

const sendEveningPush = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY;
    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      { method: 'POST' }
    );
    const result = await response.text();
    console.log('Evening push result:', result);
    return { statusCode: 200, body: JSON.stringify({ message: 'Evening push sent', result }) };
  } catch (error) {
    console.error('Evening push error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// 6:00 PM Central = 23:00 UTC
exports.handler = schedule('0 23 * * *', sendEveningPush);
