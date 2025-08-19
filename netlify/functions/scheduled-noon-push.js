const { schedule } = require('@netlify/functions');

const sendNoonPush = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY;
    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      { method: 'POST' }
    );
    const result = await response.text();
    console.log('Noon push result:', result);
    return { statusCode: 200, body: JSON.stringify({ message: 'Noon push sent', result }) };
  } catch (error) {
    console.error('Noon push error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// 12:00 PM Central = 17:00 UTC
exports.handler = schedule('0 17 * * *', sendNoonPush);
