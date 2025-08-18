const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.REACT_APP_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async event => {
  const apiKey = event.queryStringParameters?.key;
  if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // Get current UTC time to match GitHub workflow schedule
    const now = new Date();
    const utcHour = now.getUTCHours();

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: 'No subscriptions found' }) };
    }

    // Get pending tasks for task count
    const { data: tasks, error: taskError } = await supabase
      .from('todos')
      .select('user_id')
      .eq('completed', false);

    if (taskError) throw taskError;

    // Count tasks by user
    const tasksByUser = {};
    if (tasks) {
      for (const task of tasks) {
        tasksByUser[task.user_id] = (tasksByUser[task.user_id] || 0) + 1;
      }
    }

    // Generate dynamic notification with Gemini AI
    const generateDynamicNotification = async (type, taskCount) => {
      try {
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
          return getStaticNotification(type, taskCount);
        }

        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompts = {
          morning: `Generate a motivational morning notification for FinTask app. User has ${taskCount} pending tasks. Keep it under 50 characters, include emoji, be encouraging.`,
          noon: `Generate a midday motivation notification for FinTask. Encourage completing at least 4 tasks today. Keep it under 60 characters, include emoji, be energetic.`,
          afternoon: `Generate an afternoon productivity notification for FinTask. User has ${taskCount} pending tasks. Keep it under 60 characters, include emoji, be motivating.`,
          evening: `Generate an evening check-in notification. ${taskCount > 0 ? 'User has ' + taskCount + ' tasks remaining.' : 'User completed tasks today.'} Keep it under 60 characters, include emoji.`,
          night: `Generate a good night message for FinTask users who have ${taskCount} pending tasks. Keep it under 70 characters, include emoji, be appreciative and hopeful for tomorrow.`,
        };

        const result = await model.generateContent(prompts[type]);
        const aiMessage = result.response.text().trim();

        if (aiMessage && aiMessage.length < 100) {
          return {
            title: getStaticTitle(type),
            body: aiMessage,
            tag: `${type}-reminder`,
          };
        }
      } catch (error) {
        console.error('Gemini generation failed:', error);
      }

      return getStaticNotification(type, taskCount);
    };

    const getStaticTitle = type => {
      const titles = {
        morning: '🌅 Good Morning!',
        noon: '💪 Midday Boost',
        afternoon: '⚡ Afternoon Power',
        evening: '🌆 Evening Check',
        night: '🌙 Day Summary',
      };
      return titles[type] || '📱 FinTask';
    };

    // eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
    const getStaticNotification = (type, taskCount) => {
      if (type === 'morning') {
        const taskSuffix = taskCount === 1 ? '' : 's';
        const morningBody =
          taskCount > 0
            ? `You have ${taskCount} pending task${taskSuffix}. Let's tackle them!`
            : 'Ready for a productive day!';

        return {
          title: '🌅 Good Morning!',
          body: morningBody,
          tag: 'morning-reminder',
        };
      } else if (type === 'noon') {
        return {
          title: '💪 Midday Boost',
          body: 'Time to power through! Aim for 4 tasks today 💪',
          tag: 'noon-reminder',
        };
      } else if (type === 'afternoon') {
        const taskSuffix = taskCount === 1 ? '' : 's';
        const afternoonBody =
          taskCount > 0
            ? `⚡ ${taskCount} task${taskSuffix} left! You've got this!`
            : '⚡ Great progress today! Keep it up!';
        return {
          title: '⚡ Afternoon Power',
          body: afternoonBody,
          tag: 'afternoon-reminder',
        };
      } else if (type === 'evening') {
        return {
          title: '🌆 Evening Check',
          body: 'How did your day go? Time to wrap up those tasks!',
          tag: 'evening-reminder',
        };
      } else {
        // eslint-disable-next-line -- SonarCloud javascript:S1854: Variable used in complex logic
        // Night notification with task-based message
        const nightBody =
          taskCount > 0
            ? `You completed some tasks today! ${taskCount} remaining for tomorrow 🌙`
            : 'Great job today! All tasks completed 🌟 Rest well!';

        return {
          title: '🌙 Day Summary',
          body: nightBody,
          tag: 'night-reminder',
        };
      }
    };

    // Determine notification type based on UTC time (matches GitHub workflow)
    const getNotificationType = () => {
      if (utcHour === 13) return 'morning'; // 8 AM CT = 13 UTC
      if (utcHour === 17) return 'noon'; // 12 PM CT = 17 UTC
      if (utcHour === 21) return 'afternoon'; // 4 PM CT = 21 UTC
      if (utcHour === 23) return 'evening'; // 6 PM CT = 23 UTC
      if (utcHour === 2) return 'night'; // 9 PM CT = 2 UTC next day
      return 'morning'; // fallback
    };

    const notificationType = getNotificationType();
    let successCount = 0;

    for (const sub of subscriptions) {
      try {
        const userTaskCount = tasksByUser[sub.user_id] || 0;
        const notificationData = await generateDynamicNotification(notificationType, userTaskCount);

        const payload = JSON.stringify({
          ...notificationData,
          icon: '/icons/official-logo.png',
          badge: '/icons/official-logo.png',
          data: { url: '/', type: 'scheduled-reminder' },
        });

        await webpush.sendNotification(JSON.parse(sub.subscription), payload);
        successCount++;
      } catch (pushError) {
        console.error('Push failed:', pushError);
        if (pushError.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Push notifications sent',
        sent: successCount,
        total: subscriptions.length,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
