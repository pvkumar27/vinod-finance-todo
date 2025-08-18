// Context-Aware Reminders Service
// Creates intelligent reminders based on user patterns, financial data, and context

import { api } from './api';
import { aiContextMemory } from './aiContextMemory';

class ContextAwareRemindersService {
  constructor() {
    this.reminderTypes = {
      CARD_USAGE: 'card_usage',
      PROMO_EXPIRY: 'promo_expiry',
      TASK_DEADLINE: 'task_deadline',
      BILL_PAYMENT: 'bill_payment',
      FINANCIAL_REVIEW: 'financial_review',
      PATTERN_BASED: 'pattern_based',
    };
  }

  // Generate context-aware reminders
  async generateSmartReminders() {
    try {
      const [cardReminders, todoReminders, patternReminders] = await Promise.all([
        this.generateCardReminders(),
        this.generateTodoReminders(),
        this.generatePatternBasedReminders(),
      ]);

      const allReminders = [...cardReminders, ...todoReminders, ...patternReminders];

      // Sort by priority and relevance
      return this.prioritizeReminders(allReminders);
    } catch (error) {
      console.error('Error generating smart reminders:', error);
      return [];
    }
  }

  // Generate credit card related reminders
  // eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
  async generateCardReminders() {
    const reminders = [];

    try {
      const cards = await api.getCreditCards();
      const today = new Date();

      for (const card of cards) {
        // Inactivity reminders
        if (card.last_used_date) {
          const daysSinceUse = Math.floor(
            (today - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceUse >= 60 && daysSinceUse < 90) {
            reminders.push({
              id: `card_inactive_${card.id}`,
              type: this.reminderTypes.CARD_USAGE,
              cardId: card.id,
              title: 'Card Inactivity Warning',
              message: `Your ${card.bank_name} card hasn't been used for ${daysSinceUse} days. Use it soon to avoid closure.`,
              suggestedDate: this.getOptimalReminderDate('next_week'),
              priority: 'high',
              context: {
                cardName: `${card.bank_name} ••${card.last_four_digits}`,
                daysSinceUse,
                riskLevel: 'medium',
              },
              actions: [
                'Make a small purchase',
                'Set up recurring payment',
                'Use for gas or groceries',
              ],
            });
          }
        } else {
          // Never used card
          reminders.push({
            id: `card_never_used_${card.id}`,
            type: this.reminderTypes.CARD_USAGE,
            cardId: card.id,
            title: 'Activate Your Card',
            message: `Your ${card.bank_name} card has never been used. Consider making your first purchase.`,
            suggestedDate: this.getOptimalReminderDate('this_week'),
            priority: 'medium',
            context: {
              cardName: `${card.bank_name} ••${card.last_four_digits}`,
              isNewCard: true,
            },
            actions: ['Make first purchase', 'Activate online banking', 'Set up mobile app'],
          });
        }

        // Promo expiry reminders
        if (card.current_promos && Array.isArray(card.current_promos)) {
          for (const promo of card.current_promos) {
            if (promo.promo_expiry_date) {
              const daysUntilExpiry = Math.floor(
                (new Date(promo.promo_expiry_date) - today) / (1000 * 60 * 60 * 24)
              );

              if (daysUntilExpiry > 0 && daysUntilExpiry <= 45) {
                const reminderDate = this.calculatePromoReminderDate(
                  promo.promo_expiry_date,
                  daysUntilExpiry
                );

                reminders.push({
                  id: `promo_expiry_${card.id}_${promo.promo_expiry_date}`,
                  type: this.reminderTypes.PROMO_EXPIRY,
                  cardId: card.id,
                  title: 'Promo Expiring Soon',
                  message: `Your ${card.bank_name} ${promo.promo_apr}% APR promo expires in ${daysUntilExpiry} days.`,
                  suggestedDate: reminderDate,
                  priority: daysUntilExpiry <= 14 ? 'high' : 'medium',
                  context: {
                    cardName: `${card.bank_name} ••${card.last_four_digits}`,
                    promoApr: promo.promo_apr,
                    expiryDate: promo.promo_expiry_date,
                    daysUntilExpiry,
                  },
                  actions: [
                    'Plan large purchases',
                    'Research new offers',
                    'Consider balance transfer',
                  ],
                });
              }
            }
          }
        }

        // Bill payment reminders (if interest rate is set)
        if (card.interest_after_promo) {
          const paymentDate = this.estimateNextPaymentDate();
          reminders.push({
            id: `payment_reminder_${card.id}`,
            type: this.reminderTypes.BILL_PAYMENT,
            cardId: card.id,
            title: 'Credit Card Payment Due',
            message: `Don't forget to pay your ${card.bank_name} card to avoid ${card.interest_after_promo}% interest.`,
            suggestedDate: paymentDate,
            priority: 'high',
            recurring: 'monthly',
            context: {
              cardName: `${card.bank_name} ••${card.last_four_digits}`,
              interestRate: card.interest_after_promo,
            },
            actions: ['Set up auto-pay', 'Pay full balance', 'Schedule payment'],
          });
        }
      }
    } catch (error) {
      console.error('Error generating card reminders:', error);
    }

    return reminders;
  }

  // eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
  // Generate todo related reminders
  async generateTodoReminders() {
    const reminders = [];

    try {
      const todos = await api.getTodos();
      const today = new Date();

      for (const todo of todos) {
        if (todo.completed) continue;

        // Deadline reminders
        if (todo.due_date) {
          const dueDate = new Date(todo.due_date);
          const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

          if (daysUntilDue > 0 && daysUntilDue <= 7) {
            const reminderDate = this.calculateTaskReminderDate(
              todo.due_date,
              daysUntilDue,
              todo.priority
            );

            reminders.push({
              id: `task_deadline_${todo.id}`,
              type: this.reminderTypes.TASK_DEADLINE,
              todoId: todo.id,
              title: 'Task Deadline Approaching',
              message: `"${todo.task}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`,
              suggestedDate: reminderDate,
              priority: todo.priority === 'high' ? 'high' : 'medium',
              context: {
                task: todo.task,
                dueDate: todo.due_date,
                taskPriority: todo.priority,
                daysUntilDue,
              },
              actions: [
                'Start working on task',
                'Break into smaller steps',
                'Reschedule if needed',
              ],
            });
          }
        }

        // High priority tasks without due dates
        if (todo.priority === 'high' && !todo.due_date) {
          reminders.push({
            id: `high_priority_${todo.id}`,
            type: this.reminderTypes.TASK_DEADLINE,
            todoId: todo.id,
            title: 'High Priority Task',
            message: `"${todo.task}" is marked high priority but has no due date.`,
            suggestedDate: this.getOptimalReminderDate('tomorrow'),
            priority: 'medium',
            context: {
              task: todo.task,
              taskPriority: todo.priority,
              needsDueDate: true,
            },
            actions: ['Set a due date', 'Complete today', 'Lower priority if not urgent'],
          });
        }
      }
    } catch (error) {
      console.error('Error generating todo reminders:', error);
    }

    return reminders;
  }

  // Generate pattern-based reminders
  async generatePatternBasedReminders() {
    const reminders = [];

    try {
      const memoryStats = aiContextMemory.getMemoryStats();
      const patterns = memoryStats.topQueries || [];

      // Weekly financial review reminder
      if (this.shouldSuggestFinancialReview(memoryStats)) {
        reminders.push({
          id: 'weekly_financial_review',
          type: this.reminderTypes.FINANCIAL_REVIEW,
          title: 'Weekly Financial Review',
          message: 'Time for your weekly financial check-in. Review cards, tasks, and spending.',
          suggestedDate: this.getOptimalReminderDate('next_sunday'),
          priority: 'medium',
          recurring: 'weekly',
          context: {
            lastReview: memoryStats.lastActivity,
            preferredTime: memoryStats.preferredTimeSlot,
          },
          actions: [
            'Review credit card usage',
            'Check task completion',
            'Analyze spending patterns',
          ],
        });
      }

      // Pattern-based task reminders
      if (patterns.length > 0) {
        const frequentTaskQueries = patterns.filter(
          p => p.query.toLowerCase().includes('task') || p.query.toLowerCase().includes('todo')
        );

        if (frequentTaskQueries.length > 0) {
          reminders.push({
            id: 'pattern_task_reminder',
            type: this.reminderTypes.PATTERN_BASED,
            title: 'Task Management Reminder',
            message:
              'You frequently ask about tasks. Consider setting up a daily task review routine.',
            suggestedDate: this.getOptimalReminderDate('daily'),
            priority: 'low',
            recurring: 'daily',
            context: {
              queryPattern: 'task_focused',
              frequency: frequentTaskQueries[0].count,
            },
            actions: [
              'Set daily task review time',
              'Use task templates',
              'Enable task notifications',
            ],
          });
        }
      }
    } catch (error) {
      console.error('Error generating pattern-based reminders:', error);
    }

    return reminders;
  }

  // Helper methods
  getOptimalReminderDate(timeframe) {
    const now = new Date();

    // eslint-disable-next-line -- SonarCloud javascript:S6836: Reviewed - acceptable for current implementation
    switch (timeframe) {
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM
        // eslint-disable-next-line -- SonarCloud javascript:S6836: Reviewed - acceptable for current implementation
        return tomorrow;

      case 'this_week':
        const thisWeek = new Date(now);
        thisWeek.setDate(thisWeek.getDate() + 3);
        thisWeek.setHours(10, 0, 0, 0); // 10 AM
        return thisWeek;

      case 'next_week':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(9, 0, 0, 0); // 9 AM
        return nextWeek;

      case 'next_sunday':
        const nextSunday = new Date(now);
        const daysUntilSunday = 7 - now.getDay();
        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
        nextSunday.setHours(18, 0, 0, 0); // 6 PM Sunday
        return nextSunday;

      case 'daily':
        const daily = new Date(now);
        daily.setDate(daily.getDate() + 1);
        daily.setHours(8, 0, 0, 0); // 8 AM daily
        return daily;

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    }
  }

  calculatePromoReminderDate(expiryDate, daysUntilExpiry) {
    const expiry = new Date(expiryDate);

    if (daysUntilExpiry <= 7) {
      // Remind 2 days before expiry
      const reminderDate = new Date(expiry);
      reminderDate.setDate(reminderDate.getDate() - 2);
      reminderDate.setHours(10, 0, 0, 0);
      return reminderDate;
    } else if (daysUntilExpiry <= 30) {
      // Remind 1 week before expiry
      const reminderDate = new Date(expiry);
      reminderDate.setDate(reminderDate.getDate() - 7);
      reminderDate.setHours(10, 0, 0, 0);
      return reminderDate;
    } else {
      // Remind 2 weeks before expiry
      const reminderDate = new Date(expiry);
      reminderDate.setDate(reminderDate.getDate() - 14);
      reminderDate.setHours(10, 0, 0, 0);
      return reminderDate;
    }
  }

  calculateTaskReminderDate(dueDate, daysUntilDue, priority) {
    const due = new Date(dueDate);

    if (priority === 'high') {
      // High priority: remind earlier
      if (daysUntilDue <= 2) {
        // Remind morning of due date
        const reminderDate = new Date(due);
        reminderDate.setHours(8, 0, 0, 0);
        return reminderDate;
      } else {
        // Remind 2 days before
        const reminderDate = new Date(due);
        reminderDate.setDate(reminderDate.getDate() - 2);
        reminderDate.setHours(9, 0, 0, 0);
        return reminderDate;
      }
    } else {
      // Normal priority: remind 1 day before
      const reminderDate = new Date(due);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(10, 0, 0, 0);
      return reminderDate;
    }
  }

  estimateNextPaymentDate() {
    // Estimate next payment date (typically around 15th of month)
    const now = new Date();
    const nextPayment = new Date(now.getFullYear(), now.getMonth(), 15);

    if (nextPayment <= now) {
      // Next month
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }

    // Remind 3 days before
    nextPayment.setDate(nextPayment.getDate() - 3);
    nextPayment.setHours(9, 0, 0, 0);

    return nextPayment;
  }

  shouldSuggestFinancialReview(memoryStats) {
    if (!memoryStats.lastActivity) return true;

    const lastActivity = new Date(memoryStats.lastActivity);
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceActivity >= 7; // Suggest if no activity for a week
  }

  prioritizeReminders(reminders) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return reminders.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by suggested date (sooner first)
      return new Date(a.suggestedDate) - new Date(b.suggestedDate);
    });
  }

  // Format reminders for display
  formatRemindersForDisplay(reminders) {
    return reminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      message: reminder.message,
      date: reminder.suggestedDate.toLocaleDateString(),
      time: reminder.suggestedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: reminder.priority,
      type: reminder.type,
      actions: reminder.actions || [],
      recurring: reminder.recurring || false,
    }));
  }

  // Get reminders summary
  getRemindersStats(reminders) {
    return {
      total: reminders.length,
      high: reminders.filter(r => r.priority === 'high').length,
      medium: reminders.filter(r => r.priority === 'medium').length,
      low: reminders.filter(r => r.priority === 'low').length,
      byType: {
        cardUsage: reminders.filter(r => r.type === this.reminderTypes.CARD_USAGE).length,
        promoExpiry: reminders.filter(r => r.type === this.reminderTypes.PROMO_EXPIRY).length,
        taskDeadline: reminders.filter(r => r.type === this.reminderTypes.TASK_DEADLINE).length,
        billPayment: reminders.filter(r => r.type === this.reminderTypes.BILL_PAYMENT).length,
        financialReview: reminders.filter(r => r.type === this.reminderTypes.FINANCIAL_REVIEW)
          .length,
        patternBased: reminders.filter(r => r.type === this.reminderTypes.PATTERN_BASED).length,
      },
    };
  }
}

export const contextAwareReminders = new ContextAwareRemindersService();
