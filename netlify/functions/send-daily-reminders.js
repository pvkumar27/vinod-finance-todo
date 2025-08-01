// ✅ Final Lambda: Pixel-Perfect HTML Email with All Constraints Fixed
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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

    const { data: tasks, error } = await supabase
      .from('todos')
      .select('*')
      .or(`due_date.lt.${todayStr},due_date.eq.${todayStr}`)
      .eq('completed', false);

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

    for (const profile of profiles) {
      const userTasks = tasksByUser[profile.id];
      const overdueTasks = userTasks.filter(t => t.due_date < todayStr);
      const todayTasks = userTasks.filter(t => t.due_date === todayStr);

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
        <div style="font-size: 22px; font-weight: bold; line-height: 1.2;">Your Daily Tasks<br><span style="font-size: 13px; font-weight: normal; opacity: 0.9;">${(() => {
          const headerMessages = [
            "Good morning: Progress, not perfection. Let's tackle these tasks! 🔥",
            "Good morning: Small steps lead to big victories. You've got this! ✨",
            "Good morning: Every task completed is progress made. Let's go! 🚀",
            'Good morning: Focus on what matters most today. Time to shine! ☀️',
            "Good morning: Consistency beats perfection. Let's make it happen! 💪",
            'Good morning: Your future self will thank you. Start strong! 🎆',
            'Good morning: Turn your to-dos into ta-das! Ready to conquer? 🏆',
          ];
          return headerMessages[new Date().getDate() % headerMessages.length];
        })()}</span></div>
      </div>
    </div>
    
    <!-- Task Count -->
    <div style="font-size: 18px; font-weight: 600; margin: 24px 0 12px; text-align: left; color: #6b7280;">
      ${(() => {
        const messages = [
          `You have <strong>${userTasks.length}</strong> pending tasks that need attention:`,
          `Ready to tackle <strong>${userTasks.length}</strong> tasks today? Let's get started:`,
          `Time to conquer <strong>${userTasks.length}</strong> pending items on your list:`,
          `<strong>${userTasks.length}</strong> tasks are waiting for your attention:`,
          `Let's make progress on these <strong>${userTasks.length}</strong> important tasks:`,
          `Your productivity journey continues with <strong>${userTasks.length}</strong> tasks:`,
          `Focus time! You have <strong>${userTasks.length}</strong> tasks to complete:`,
        ];
        return messages[new Date().getDate() % messages.length];
      })()}
    </div>
    
    <!-- Main Layout -->
    <div>
      
      <!-- Pending Tasks Section -->
      <div style="max-width: 600px;">
        

        
        <!-- All Tasks Combined -->
        ${[...todayTasks, ...overdueTasks]
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .map((task, index, allTasks) => {
            const isToday = task.due_date === todayStr;
            const isOverdue = task.due_date < todayStr;

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
            } else {
              bgColor = '#ffffff';
              borderColor = '#e2e8f0';
              textColor = '#2d3748';
            }

            const indicator = isToday ? '📅' : isOverdue ? '⚠️' : '';

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
