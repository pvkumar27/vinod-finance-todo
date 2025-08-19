// ❌ DEPRECATED: Netlify scheduled functions are unreliable
// ✅ NEW: This function is now triggered by GitHub Actions at 9AM Central
// See: .github/workflows/daily-notifications.yml

// This function is kept for manual testing only
exports.handler = async event => {
  const apiKey = event.queryStringParameters?.key;
  if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - use GitHub Actions for scheduled runs' }),
    };
  }

  try {
    const response = await fetch(
      `https://fintask.netlify.app/.netlify/functions/send-push-reminders?key=${apiKey}`,
      {
        method: 'POST',
      }
    );

    const result = await response.text();
    console.log('Manual push notification result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Manual push notifications sent',
        result,
        note: 'Scheduled runs now use GitHub Actions',
      }),
    };
  } catch (error) {
    console.error('Push notification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// ⚠️  IMPORTANT: Scheduled push notifications are now handled by:
// GitHub Actions workflow: .github/workflows/daily-notifications.yml
// Runs daily at 9:00 AM Central Time (14:00 UTC)
