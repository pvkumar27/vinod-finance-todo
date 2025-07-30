const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Verify API key
  const apiKey = event.queryStringParameters?.key;
  if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    // Get today's date in Central Time
    const today = new Date();
    const centralTime = new Date(today.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const todayStr = centralTime.toISOString().split('T')[0];

    // Get overdue and today's tasks
    const { data: tasks, error } = await supabase
      .from('todos')
      .select('*')
      .or(`due_date.lt.${todayStr},due_date.eq.${todayStr}`)
      .eq('completed', false);

    if (error) {
      throw error;
    }

    if (!tasks || tasks.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No tasks due today or overdue' }),
      };
    }

    // Group tasks by user
    const tasksByUser = {};
    for (const task of tasks) {
      if (!tasksByUser[task.user_id]) {
        tasksByUser[task.user_id] = [];
      }
      tasksByUser[task.user_id].push(task);
    }

    // Get user emails from users table
    const userIds = Object.keys(tasksByUser);
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (profileError) {
      console.error('User query error:', profileError);
      throw new Error(`Failed to get users: ${profileError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No user emails found for tasks' }),
      };
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let emailsSent = 0;

    // Send emails
    for (const profile of profiles) {
      const userTasks = tasksByUser[profile.id];
      const overdueTasks = userTasks.filter(task => task.due_date < todayStr);
      const todayTasks = userTasks.filter(task => task.due_date === todayStr);

      let emailBody = `
        <h2>📋 Daily Task Reminder</h2>
        <p>Good morning! Here are your pending tasks:</p>
      `;

      if (overdueTasks.length > 0) {
        emailBody += `
          <h3>🚨 Overdue Tasks (${overdueTasks.length})</h3>
          <ul>
            ${overdueTasks.map(task => `<li><strong>${task.title}</strong> - Due: ${task.due_date}</li>`).join('')}
          </ul>
        `;
      }

      if (todayTasks.length > 0) {
        emailBody += `
          <h3>📅 Due Today (${todayTasks.length})</h3>
          <ul>
            ${todayTasks.map(task => `<li><strong>${task.title}</strong></li>`).join('')}
          </ul>
        `;
      }

      emailBody += `
        <p>Visit <a href="https://fintask.netlify.app">FinTask</a> to manage your tasks.</p>
        <p>Have a productive day! 🚀</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: profile.email,
        subject: `📋 Daily Reminder: ${userTasks.length} task(s) pending`,
        html: emailBody,
      });

      emailsSent++;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Sent notifications for ${tasks.length} tasks to ${emailsSent} users`,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
