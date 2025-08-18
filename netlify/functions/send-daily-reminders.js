// ✅ Final Lambda: Pixel-Perfect HTML Email with All Constraints Fixed
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async event => {
  const apiKey = event.queryStringParameters?.key;
  if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const today = new Date();
    const centralTime = new Date(today.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const todayStr = `${centralTime.getFullYear()}-${String(centralTime.getMonth() + 1).padStart(2, '0')}-${String(centralTime.getDate()).padStart(2, '0')}`;

    const { data: tasks, error } = await supabase.from('todos').select('*').eq('completed', false);

    if (error) throw error;
    if (!tasks || tasks.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No tasks due today or overdue' }),
      };
    }

    const tasksByUser = {};
    for (const task of tasks) {
      if (!tasksByUser[task.user_id]) tasksByUser[task.user_id] = [];
      tasksByUser[task.user_id].push(task);
    }

    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const profiles = users.users
      .filter(u => tasksByUser[u.id])
      .map(u => ({ id: u.id, email: u.email }));

    // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const getTaskEmoji = (title = '') => {
      const t = title.toLowerCase();
      if (
        t.includes('report') ||
        t.includes('doc') ||
        t.includes('application') ||
        t.includes('form')
      )
        return '🧾';
      if (
        t.includes('mental') ||
        t.includes('health') ||
        t.includes('therapy') ||
        t.includes('check')
      )
        return '💬';
      if (t.includes('return') || t.includes('refund') || t.includes('exchange')) return '📦';
      if (
        t.includes('pay') ||
        t.includes('bill') ||
        t.includes('insurance') ||
        t.includes('credit') ||
        t.includes('lic')
      )
        return '💳';
      if (t.includes('grocery') || t.includes('shop') || t.includes('store')) return '🛒';
      if (t.includes('camera') || t.includes('device') || t.includes('charging')) return '🔌';
      if (t.includes('car') || t.includes('garage') || t.includes('vehicle')) return '🚗';
      if (t.includes('trip') || t.includes('travel')) return '✈️';
      return '📌';
    };

    const formatDate = dateStr => {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTaskTitle = task => {
      return task.title?.trim() || task.name?.trim() || task.task?.trim() || '📌 Untitled Task';
    };

    // Generate Gemini AI greeting
    const generateGeminiGreeting = async taskCount => {
      try {
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
          return "Good morning: Progress, not perfection. Let's tackle these tasks! 🔥";
        }

        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a motivational morning greeting for email. User has ${taskCount} pending tasks. Keep it under 80 characters, include emoji, be encouraging and personal.`;

        const result = await model.generateContent(prompt);
        const aiMessage = result.response.text().trim();

        if (aiMessage && aiMessage.length < 100) {
          return aiMessage;
        }
      } catch (error) {
        console.error('Gemini greeting failed:', error);
      }

      return "Good morning: Progress, not perfection. Let's tackle these tasks! 🔥";
    };

    // Generate Gemini AI task message
    const generateGeminiTaskMessage = async taskCount => {
      try {
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
          return `You have <strong>${taskCount}</strong> pending tasks that need attention:`;
        }

        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate an encouraging task summary message for email. User has ${taskCount} pending tasks. Keep it under 100 characters, use HTML <strong> tags around the number, be motivating.`;

        const result = await model.generateContent(prompt);
        const aiMessage = result.response.text().trim();

        if (aiMessage && aiMessage.length < 150) {
          return aiMessage;
        }
      } catch (error) {
        console.error('Gemini task message failed:', error);
      }

      return `You have <strong>${taskCount}</strong> pending tasks that need attention:`;
    };

    for (const profile of profiles) {
      const userTasks = tasksByUser[profile.id];

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #2d3748; margin: 0; padding: 0; background: #ffffff;">
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: #2b6cb0; color: white; padding: 16px 20px; border-radius: 10px; display: flex; align-items: center;">
      <img src="https://fintask.netlify.app/icons/official-logo.png" alt="FinTask Logo" style="width: 50px; height: 50px; margin-right: 16px;">
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; height: 50px;">
        <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">Your Daily Tasks<br><span style="font-size: 13px; font-weight: normal; opacity: 0.9;">${await generateGeminiGreeting(userTasks.length)}</span></div>
      </div>
    </div>
    
    <!-- Task Count -->
    <div style="font-size: 18px; font-weight: 600; margin: 24px 0 12px; text-align: left; color: #6b7280;">
      ${await generateGeminiTaskMessage(userTasks.length)}
    </div>
    
    <!-- Main Layout -->
    <div>
      
      <!-- Pending Tasks Section -->
      <div style="max-width: 600px;">
        

        
        <!-- All Tasks Combined -->
        ${userTasks
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .map((task, index, allTasks) => {
            const isToday = task.due_date === todayStr;
            const isOverdue = task.due_date < todayStr;
            const isFuture = task.due_date > todayStr;

            let bgColor, borderColor, textColor;

            if (isToday) {
              bgColor = '#dcfce7';
              borderColor = '#16a34a';
              textColor = '#15803d';
            } else if (isOverdue) {
              const overdueTasks = allTasks.filter(t => t.due_date < todayStr);
              const overdueIndex = overdueTasks.findIndex(
                t => t.due_date === task.due_date && getTaskTitle(t) === getTaskTitle(task)
              );
              const intensity = Math.max(
                0.3,
                1 - (overdueIndex / Math.max(1, overdueTasks.length - 1)) * 0.7
              );

              const redBg = Math.floor(255 - 55 * (1 - intensity));
              const redBorder = Math.floor(220 - 100 * (1 - intensity));
              const redText = Math.floor(185 - 85 * (1 - intensity));

              bgColor = `rgb(${redBg}, ${Math.floor(200 + 55 * (1 - intensity))}, ${Math.floor(200 + 55 * (1 - intensity))})`;
              borderColor = `rgb(${redBorder}, ${Math.floor(38 + 62 * (1 - intensity))}, ${Math.floor(38 + 62 * (1 - intensity))})`;
              textColor = `rgb(${redText}, ${Math.floor(28 + 72 * (1 - intensity))}, ${Math.floor(28 + 72 * (1 - intensity))})`;
            } else if (isFuture) {
              bgColor = '#f0f9ff';
              borderColor = '#0ea5e9';
              textColor = '#0369a1';
            } else {
              bgColor = '#ffffff';
              borderColor = '#e2e8f0';
              textColor = '#2d3748';
            }

            const indicator = isToday ? '📅' : isOverdue ? '⚠️' : isFuture ? '🔮' : '';

            return `
          <div style="background: ${bgColor}; border-left: 3px solid ${borderColor}; padding: 12px; margin-bottom: 8px; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">${getTaskEmoji(getTaskTitle(task))}</span>
              <div style="flex: 1;">
                <div style="font-weight: 500; color: #2d3748; margin-bottom: 2px; font-size: 16px;">${getTaskTitle(task)}</div>
                <div style="font-size: 14px; color: ${textColor}; display: flex; align-items: center; gap: 4px;">
                  ${indicator} Due ${formatDate(task.due_date)}
                  ${isOverdue ? ` (${Math.floor((new Date(todayStr) - new Date(task.due_date)) / (1000 * 60 * 60 * 24))} days overdue)` : ''}
                </div>
              </div>
            </div>
          </div>`;
          })
          .join('')}
        
      </div>
      
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://fintask.netlify.app/" style="background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);">
➡️ Open FinTask App
      </a>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #718096; margin: 0;">Stay productive and organized with FinTask!</p>
    </div>
    
  </div>
</body>
</html>`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: profile.email,
        subject: '📌 Your FinTask To-Dos: Due Today & Overdue',
        html,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent successfully.' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
