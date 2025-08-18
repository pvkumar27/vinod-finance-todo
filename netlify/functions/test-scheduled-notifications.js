// Manual test endpoint for scheduled notifications
exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Call the existing send-push-reminders function
    const response = await fetch(
      'https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=fintask_notify_2025_secure_key_v1',
      {
        method: 'POST',
      }
    );

    const result = await response.text();
    console.log('Manual test notification result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Manual test notification sent',
        result: result,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Manual test notification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
