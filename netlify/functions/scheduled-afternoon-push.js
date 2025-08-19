const { schedule } = require('@netlify/functions');

const sendAfternoonPush = async () => {
  try {
    const apiKey = process.env.NOTIFICATION_API_KEY;
    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      { method: 'POST' }
    );
    const result = await response.text();
    console.log('Afternoon push result:', result);
    return { statusCode: 200, body: JSON.stringify({ message: 'Afternoon push sent', result }) };
  } catch (error) {
    console.error('Afternoon push error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// 4:00 PM Central = 21:00 UTC
exports.handler = schedule('0 21 * * *', sendAfternoonPush);
