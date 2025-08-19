const { schedule } = require('@netlify/functions');

const sendNightPush = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY;
    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      { method: 'POST' }
    );
    const result = await response.text();
    console.log('Night push result:', result);
    return { statusCode: 200, body: JSON.stringify({ message: 'Night push sent', result }) };
  } catch (error) {
    console.error('Night push error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// 9:00 PM Central = 02:00 UTC next day
exports.handler = schedule('0 2 * * *', sendNightPush);
