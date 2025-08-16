import PushNotificationService from '../services/pushNotifications';

/**
 * Notification Scheduler for FinTask
 * Handles scheduling and triggering of financial reminders
 */

class NotificationScheduler {
  constructor() {
    this.scheduledNotifications = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the notification scheduler
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Check if notifications are enabled
      const permission = PushNotificationService.getPermissionStatus();
      if (permission !== 'granted') {
        console.log('Notifications not enabled, skipping scheduler init');
        return;
      }

      // Set up daily reminders
      this.scheduleDailyReminders();

      // Set up credit card specific reminders
      this.scheduleCreditCardReminders();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification scheduler:', error);
    }
  }

  /**
   * Schedule daily FinTask reminders
   */
  scheduleDailyReminders() {
    // Morning reminder (8 AM) - pending tasks count
    this.scheduleRepeatingNotification('morning-tasks', {
      hour: 8,
      minute: 0,
      title: '🌅 Good Morning!',
      body: 'Checking your pending tasks...',
      tag: 'morning-tasks',
      data: { type: 'morning', action: 'check-tasks' },
    });

    // Noon reminder (12 PM) - motivational
    this.scheduleRepeatingNotification('noon-motivation', {
      hour: 12,
      minute: 0,
      title: '💪 Midday Motivation',
      body: "Ready to crush at least 4 tasks today? You've got this!",
      tag: 'noon-motivation',
      data: { type: 'noon', action: 'motivate' },
    });

    // Evening reminder (6 PM) - progress check
    this.scheduleRepeatingNotification('evening-cheer', {
      hour: 18,
      minute: 0,
      title: '🎉 Evening Check-in',
      body: 'Checking your progress...',
      tag: 'evening-cheer',
      data: { type: 'evening', action: 'check-progress' },
    });

    // Night summary (9 PM) - day summary
    this.scheduleRepeatingNotification('night-summary', {
      hour: 21,
      minute: 0,
      title: '🌙 Day Summary',
      body: "Let's see how you did today...",
      tag: 'night-summary',
      data: { type: 'night', action: 'summarize' },
    });
  }

  /**
   * Schedule credit card specific reminders
   */
  scheduleCreditCardReminders() {
    // Weekly credit card review (Sunday 10 AM)
    this.scheduleWeeklyNotification('weekly-cards', {
      dayOfWeek: 0, // Sunday
      hour: 10,
      minute: 0,
      title: '💳 Weekly Card Review',
      body: 'Time to check your credit card activity and payments',
      tag: 'weekly-cards',
      data: { type: 'credit-cards', action: 'weekly-review' },
    });
  }

  /**
   * Schedule a repeating daily notification with dynamic content
   */
  scheduleRepeatingNotification(id, config) {
    const { hour, minute, tag, data } = config;

    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(async () => {
        try {
          const { title, body } = await this.generateDynamicContent(data.type, data.action);

          await PushNotificationService.showLocalNotification(title, {
            body,
            tag,
            data,
            requireInteraction: false,
            actions: [
              {
                action: 'open',
                title: '📱 Open FinTask',
              },
              {
                action: 'dismiss',
                title: '✖️ Dismiss',
              },
            ],
          });

          // Schedule the next occurrence
          scheduleNext();
        } catch (error) {
          console.error('Failed to show scheduled notification:', error);
        }
      }, timeUntilNotification);

      this.scheduledNotifications.set(id, timeoutId);
    };

    scheduleNext();
  }

  /**
   * Schedule a weekly notification
   */
  scheduleWeeklyNotification(id, config) {
    const { dayOfWeek, hour, minute, title, body, tag, data } = config;

    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();

      // Calculate next occurrence of the specified day and time
      const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
      scheduledTime.setDate(now.getDate() + daysUntilTarget);
      scheduledTime.setHours(hour, minute, 0, 0);

      // If it's the same day but time has passed, schedule for next week
      if (daysUntilTarget === 0 && scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 7);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(async () => {
        try {
          await PushNotificationService.showLocalNotification(title, {
            body,
            tag,
            data,
            requireInteraction: false,
          });

          // Schedule the next occurrence
          scheduleNext();
        } catch (error) {
          console.error('Failed to show scheduled notification:', error);
        }
      }, timeUntilNotification);

      this.scheduledNotifications.set(id, timeoutId);
    };

    scheduleNext();
  }

  /**
   * Send immediate notification for specific events
   */
  async sendImmediateNotification(type, data = {}) {
    const notifications = {
      'task-overdue': {
        title: '⚠️ Task Overdue!',
        body: `You have ${data.count || 1} overdue task${data.count !== 1 ? 's' : ''}`,
        tag: 'task-overdue',
      },
      'card-inactive': {
        title: '💳 Inactive Card Alert',
        body: `${data.cardName || 'A credit card'} hasn't been used in 90+ days`,
        tag: 'card-inactive',
      },
      'payment-reminder': {
        title: '💰 Payment Reminder',
        body: `Don't forget to pay your ${data.cardName || 'credit card'} bill`,
        tag: 'payment-reminder',
      },
      'expense-log': {
        title: '📝 Log Your Expenses',
        body: 'Remember to track your spending for today',
        tag: 'expense-log',
      },
    };

    const notification = notifications[type];
    if (!notification) {
      console.error('Unknown notification type:', type);
      return;
    }

    try {
      await PushNotificationService.showLocalNotification(notification.title, {
        body: notification.body,
        tag: notification.tag,
        data: { type, ...data },
        requireInteraction: type === 'task-overdue' || type === 'payment-reminder',
      });
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(id) {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications() {
    for (const [, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
    }
    this.scheduledNotifications.clear();
    this.isInitialized = false;
  }

  /**
   * Generate dynamic notification content using Gemini AI
   */
  async generateDynamicContent(type, action) {
    try {
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      const pendingTasks = todos.filter(t => !t.completed);
      const completedToday = todos.filter(t => {
        if (!t.completed || !t.completed_at) return false;
        const today = new Date().toDateString();
        return new Date(t.completed_at).toDateString() === today;
      });

      // Try Gemini AI first
      const geminiContent = await this.generateGeminiNotification(
        type,
        pendingTasks.length,
        completedToday.length
      );
      if (geminiContent) {
        return geminiContent;
      }

      // Fallback to static messages
      return this.generateStaticContent(type, pendingTasks.length, completedToday.length);
    } catch (error) {
      console.error('Error generating dynamic content:', error);
      return this.generateStaticContent(type, 0, 0);
    }
  }

  /**
   * Generate notification using Gemini AI
   */
  async generateGeminiNotification(type, pendingCount, completedCount) {
    try {
      const { GeminiClient } = await import('../services/geminiClient');
      const geminiClient = new GeminiClient();

      const prompts = {
        morning: `Generate a motivational morning notification for FinTask app. User has ${pendingCount} pending tasks. Keep it under 50 characters, include emoji, be encouraging.`,
        noon: `Generate a midday motivation notification for FinTask. Encourage completing at least 4 tasks today. Keep it under 60 characters, include emoji, be energetic.`,
        evening:
          completedCount > 0
            ? `Generate a celebration notification. User completed ${completedCount} tasks today. Keep it under 60 characters, include emoji, be congratulatory.`
            : `Generate an encouraging evening notification. User hasn't completed tasks yet. Keep it under 60 characters, include emoji, be supportive.`,
        night:
          completedCount > 0
            ? `Generate a good night appreciation message. User completed ${completedCount} tasks today. Keep it under 70 characters, include emoji, be appreciative.`
            : `Generate an encouraging good night message for tomorrow. Keep it under 70 characters, include emoji, be hopeful.`,
      };

      const response = await geminiClient.processQuery(
        `Create a notification message: ${prompts[type]} Return only the message text, no quotes or extra formatting.`
      );

      if (response.message && response.message.length < 100) {
        return {
          title: this.getStaticTitle(type),
          body: response.message,
        };
      }
    } catch (error) {
      console.error('Gemini notification generation failed:', error);
    }
    return null;
  }

  /**
   * Get static title for notification type
   */
  getStaticTitle(type) {
    const titles = {
      morning: '🌅 Good Morning!',
      noon: '💪 Midday Boost',
      evening: '🌆 Evening Check',
      night: '🌙 Day Summary',
    };
    return titles[type] || '📱 FinTask';
  }

  /**
   * Generate static notification content (fallback)
   */
  generateStaticContent(type, pendingCount, completedCount) {
    switch (type) {
      case 'morning':
        return {
          title: '🌅 Good Morning!',
          body:
            pendingCount === 0
              ? 'All tasks complete! Ready for a productive day?'
              : `You have ${pendingCount} pending task${pendingCount !== 1 ? 's' : ''}. Let's tackle them!`,
        };

      case 'noon':
        return {
          title: '💪 Midday Motivation',
          body: 'Time to power through! Aim for 4 tasks today 💪',
        };

      case 'evening':
        if (completedCount > 0) {
          return {
            title: '🎉 Great Progress!',
            body: `Amazing! You completed ${completedCount} task${completedCount !== 1 ? 's' : ''} today! 🎉`,
          };
        } else {
          return {
            title: '🌆 Evening Check',
            body: 'Still time to complete a task or two before bed! 💪',
          };
        }

      case 'night':
        if (completedCount > 0) {
          return {
            title: '🌙 Day Complete!',
            body: `Wonderful day! You completed ${completedCount} task${completedCount !== 1 ? 's' : ''}. Sweet dreams! 🌙✨`,
          };
        } else {
          return {
            title: '🌙 Rest & Recharge',
            body: "Tomorrow is a fresh start! You've got this! 🌅💪",
          };
        }

      default:
        return {
          title: '📱 FinTask Reminder',
          body: 'Check your tasks and stay productive!',
        };
    }
  }

  /**
   * Update todos in localStorage when tasks change
   */
  updateTodosCache(todos) {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to update todos cache:', error);
    }
  }

  /**
   * Mark task as completed with timestamp
   */
  markTaskCompleted(taskId) {
    try {
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      const updatedTodos = todos.map(todo =>
        todo.id === taskId
          ? { ...todo, completed: true, completed_at: new Date().toISOString() }
          : todo
      );
      this.updateTodosCache(updatedTodos);
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
    }
  }
}

const notificationScheduler = new NotificationScheduler();
export default notificationScheduler;
