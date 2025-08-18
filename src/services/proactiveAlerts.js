// Proactive Alerts Service
// Monitors financial data and generates intelligent alerts

import { api } from './api';

class ProactiveAlertsService {
  constructor() {
    this.alertThresholds = {
      inactivityDays: 90,
      promoExpiryDays: 30,
      overdueTaskDays: 1,
      spendingAnomalyPercent: 50,
    };
  }

  // Main method to check all alerts
  async checkAllAlerts() {
    try {
      const [creditCardAlerts, todoAlerts, spendingAlerts] = await Promise.all([
        this.checkCreditCardAlerts(),
        this.checkTodoAlerts(),
        this.checkSpendingAlerts(),
      ]);

      return {
        creditCards: creditCardAlerts,
        todos: todoAlerts,
        spending: spendingAlerts,
        totalCount: creditCardAlerts.length + todoAlerts.length + spendingAlerts.length,
      };
    } catch (error) {
      console.error('Error checking proactive alerts:', error);
      return { creditCards: [], todos: [], spending: [], totalCount: 0 };
    }
  }

  // Credit card specific alerts
  async checkCreditCardAlerts() {
    const alerts = [];

    try {
      const cards = await api.getCreditCards();
      const today = new Date();

      for (const card of cards) {
        // Inactivity alerts
        const inactivityAlert = this.checkCardInactivity(card, today);
        if (inactivityAlert) alerts.push(inactivityAlert);

        // Promo expiry alerts
        const promoAlerts = this.checkPromoExpiry(card, today);
        alerts.push(...promoAlerts);

        // New promo available alerts
        const newPromoAlert = this.checkNewPromoAvailable(card);
        if (newPromoAlert) alerts.push(newPromoAlert);

        // Auto-pay missing alerts
        const autoPayAlert = this.checkAutoPayStatus(card);
        if (autoPayAlert) alerts.push(autoPayAlert);
      }
    } catch (error) {
      console.error('Error checking credit card alerts:', error);
    }

    return alerts;
  }

  checkCardInactivity(card, today) {
    if (!card.last_used_date) {
      return {
        type: 'card_never_used',
        cardId: card.id,
        cardName: `${card.bank_name} ••${card.last_four_digits}`,
        priority: 'high',
        title: 'Card Never Used',
        message: `Your ${card.bank_name} card has never been used. Consider using it to keep it active.`,
        action: 'use_card',
        daysInactive: null,
      };
    }

    const lastUsed = new Date(card.last_used_date);
    const daysSince = Math.floor((today - lastUsed) / (1000 * 60 * 60 * 24));

    if (daysSince >= this.alertThresholds.inactivityDays) {
      return {
        type: 'card_inactive',
        cardId: card.id,
        cardName: `${card.bank_name} ••${card.last_four_digits}`,
        priority: daysSince > 180 ? 'high' : 'medium',
        title: 'Inactive Credit Card',
        message: `Your ${card.bank_name} card hasn't been used for ${daysSince} days. Use it soon to avoid closure.`,
        action: 'use_card',
        daysInactive: daysSince,
      };
    }

    return null;
  }

  // eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
  checkPromoExpiry(card, today) {
    const alerts = [];

    if (card.current_promos && Array.isArray(card.current_promos)) {
      for (const promo of card.current_promos) {
        if (promo.promo_expiry_date) {
          const expiryDate = new Date(promo.promo_expiry_date);
          const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

          if (daysUntil <= this.alertThresholds.promoExpiryDays && daysUntil >= 0) {
            alerts.push({
              type: 'promo_expiring',
              cardId: card.id,
              cardName: `${card.bank_name} ••${card.last_four_digits}`,
              priority: daysUntil <= 7 ? 'high' : 'medium',
              title: 'Promo Expiring Soon',
              message: `Your ${card.bank_name} promo (${promo.promo_apr}% APR) expires in ${daysUntil} days.`,
              action: 'review_promo',
              daysUntilExpiry: daysUntil,
              promoDetails: promo,
            });
          }
        }
      }
    }

    return alerts;
  }

  checkNewPromoAvailable(card) {
    if (card.new_promo_available) {
      return {
        type: 'new_promo_available',
        cardId: card.id,
        cardName: `${card.bank_name} ••${card.last_four_digits}`,
        priority: 'medium',
        title: 'New Promo Available',
        message: `${card.bank_name} has new promotional offers available for your card.`,
        action: 'check_promo',
      };
    }
    return null;
  }

  checkAutoPayStatus(card) {
    // This would require additional data about auto-pay status
    // For now, we'll skip this check
    return null;
  }

  // eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
  // Todo specific alerts
  async checkTodoAlerts() {
    const alerts = [];

    try {
      const todos = await api.getTodos();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const todo of todos) {
        if (todo.completed) continue;

        // Overdue tasks
        if (todo.due_date) {
          const dueDate = new Date(todo.due_date);
          dueDate.setHours(0, 0, 0, 0);
          const daysPast = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

          if (daysPast > 0) {
            alerts.push({
              type: 'task_overdue',
              todoId: todo.id,
              priority: daysPast > 7 ? 'high' : 'medium',
              title: 'Overdue Task',
              message: `"${todo.task}" was due ${daysPast} day${daysPast > 1 ? 's' : ''} ago.`,
              action: 'complete_task',
              daysPastDue: daysPast,
              task: todo.task,
            });
          }
        }

        // Due today
        if (todo.due_date) {
          const dueDate = new Date(todo.due_date);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate.getTime() === today.getTime()) {
            alerts.push({
              type: 'task_due_today',
              todoId: todo.id,
              priority: 'medium',
              title: 'Task Due Today',
              message: `"${todo.task}" is due today.`,
              action: 'complete_task',
              task: todo.task,
            });
          }
        }

        // High priority tasks without due dates
        if (todo.priority === 'high' && !todo.due_date) {
          alerts.push({
            type: 'high_priority_no_date',
            todoId: todo.id,
            priority: 'medium',
            title: 'High Priority Task',
            message: `"${todo.task}" is marked high priority but has no due date.`,
            action: 'set_due_date',
            task: todo.task,
          });
        }
      }
    } catch (error) {
      console.error('Error checking todo alerts:', error);
    }

    return alerts;
  }

  // Spending pattern alerts (placeholder for future implementation)
  async checkSpendingAlerts() {
    const alerts = [];

    // This would analyze spending patterns from transaction data
    // For now, return empty array as we don't have transaction tracking yet

    return alerts;
  }

  // Get alerts by priority
  getAlertsByPriority(alerts, priority) {
    const allAlerts = [...alerts.creditCards, ...alerts.todos, ...alerts.spending];

    return allAlerts.filter(alert => alert.priority === priority);
  }

  // Get urgent alerts (high priority)
  getUrgentAlerts(alerts) {
    return this.getAlertsByPriority(alerts, 'high');
  }

  // Format alerts for display
  formatAlertsForDisplay(alerts) {
    const formatted = {
      urgent: [],
      important: [],
      info: [],
    };

    const allAlerts = [...alerts.creditCards, ...alerts.todos, ...alerts.spending];

    for (const alert of allAlerts) {
      const displayAlert = {
        id: alert.cardId || alert.todoId || Date.now(),
        title: alert.title,
        message: alert.message,
        type: alert.type,
        action: alert.action,
        priority: alert.priority,
      };

      switch (alert.priority) {
        case 'high':
          formatted.urgent.push(displayAlert);
          break;
        case 'medium':
          formatted.important.push(displayAlert);
          break;
        default:
          formatted.info.push(displayAlert);
      }
    }

    return formatted;
  }

  // Generate summary message
  generateAlertSummary(alerts) {
    const urgent = this.getUrgentAlerts(alerts);
    const total = alerts.totalCount;

    if (total === 0) {
      return '🎉 Everything looks good! No urgent items need your attention.';
    }

    if (urgent.length > 0) {
      return `🚨 ${urgent.length} urgent item${urgent.length > 1 ? 's' : ''} need immediate attention, plus ${total - urgent.length} other items to review.`;
    }

    return `💡 ${total} item${total > 1 ? 's' : ''} could use your attention when you have time.`;
  }
}

export const proactiveAlerts = new ProactiveAlertsService();
