// Natural Language Bulk Operations Service
// Handles bulk operations through natural language commands

import { api } from './api';

class NaturalLanguageBulkService {
  constructor() {
    this.bulkPatterns = {
      // Todo bulk operations
      todos: {
        complete: [
          /complete all (overdue|pending|high priority) (tasks|todos)/i,
          /mark all (.*) (tasks|todos) as (done|complete)/i,
          /finish all (tasks|todos) (due|from) (today|yesterday|this week)/i,
        ],
        delete: [
          /delete all (completed|done) (tasks|todos)/i,
          /remove all (old|completed) (tasks|todos)/i,
          /clear (completed|done) (tasks|todos)/i,
        ],
        create: [
          /add (tasks|todos) for (.+)/i,
          /create (daily|weekly|monthly) (tasks|todos) for (.+)/i,
          /bulk add (tasks|todos): (.+)/i,
        ],
        update: [
          /set all (.*) (tasks|todos) to (high|medium|low) priority/i,
          /update all (tasks|todos) due (.+) to (.+)/i,
          /change all (.*) (tasks|todos) due date to (.+)/i,
        ],
      },
      // Credit card bulk operations
      cards: {
        update: [
          /mark all (.+) cards as (active|inactive)/i,
          /update all cards last used to (.+)/i,
          /set all (.+) cards to (.+)/i,
        ],
        analyze: [
          /show me all (inactive|active|expiring) cards/i,
          /analyze all cards (usage|promos|activity)/i,
          /compare all my cards/i,
        ],
      },
    };
  }

  // Main method to process bulk operations
  async processBulkOperation(query) {
    const operation = this.identifyBulkOperation(query);

    if (!operation) {
      return {
        success: false,
        message:
          "I don't recognize that as a bulk operation. Try commands like 'complete all overdue tasks' or 'delete all completed todos'.",
      };
    }

    try {
      const result = await this.executeBulkOperation(operation, query);
      return {
        success: true,
        operation: operation.type,
        category: operation.category,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to execute bulk operation: ${error.message}`,
      };
    }
  }

  // Identify the type of bulk operation from query
  identifyBulkOperation(query) {
    const lowerQuery = query.toLowerCase();

    // Check todo patterns
    for (const [action, patterns] of Object.entries(this.bulkPatterns.todos)) {
      for (const pattern of patterns) {
        const match = lowerQuery.match(pattern);
        if (match) {
          return {
            category: 'todos',
            type: action,
            match: match,
            originalQuery: query,
          };
        }
      }
    }

    // Check card patterns
    for (const [action, patterns] of Object.entries(this.bulkPatterns.cards)) {
      for (const pattern of patterns) {
        const match = lowerQuery.match(pattern);
        if (match) {
          return {
            category: 'cards',
            type: action,
            match: match,
            originalQuery: query,
          };
        }
      }
    }

    return null;
  }

  // Execute the identified bulk operation
  async executeBulkOperation(operation, query) {
    switch (operation.category) {
      case 'todos':
        return await this.executeTodoBulkOperation(operation);
      case 'cards':
        return await this.executeCardBulkOperation(operation);
      default:
        throw new Error('Unknown operation category');
    }
  }

  // Execute todo bulk operations
  async executeTodoBulkOperation(operation) {
    const todos = await api.getTodos();

    switch (operation.type) {
      case 'complete':
        return await this.bulkCompleteTodos(todos, operation);
      case 'delete':
        return await this.bulkDeleteTodos(todos, operation);
      case 'create':
        return await this.bulkCreateTodos(operation);
      case 'update':
        return await this.bulkUpdateTodos(todos, operation);
      default:
        throw new Error('Unknown todo bulk operation');
    }
  }

  async bulkCompleteTodos(todos, operation) {
    const match = operation.match;
    let targetTodos = [];

    // Filter todos based on the criteria
    if (match[1]?.includes('overdue')) {
      const today = new Date();
      targetTodos = todos.filter(
        todo => !todo.completed && todo.due_date && new Date(todo.due_date) < today
      );
    } else if (match[1]?.includes('pending')) {
      targetTodos = todos.filter(todo => !todo.completed);
    } else if (match[1]?.includes('high priority')) {
      targetTodos = todos.filter(todo => !todo.completed && todo.priority === 'high');
    }

    // Complete the todos
    const results = await Promise.allSettled(
      targetTodos.map(todo => api.updateTodo(todo.id, { ...todo, completed: true }))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `✅ Completed ${successful} task${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      completedCount: successful,
      failedCount: failed,
      affectedTodos: targetTodos.slice(0, successful),
    };
  }

  async bulkDeleteTodos(todos, operation) {
    const match = operation.match;
    let targetTodos = [];

    // Filter todos based on criteria
    if (match[1]?.includes('completed') || match[1]?.includes('done')) {
      targetTodos = todos.filter(todo => todo.completed);
    } else if (match[1]?.includes('old')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      targetTodos = todos.filter(
        todo => todo.completed && new Date(todo.created_at) < thirtyDaysAgo
      );
    }

    // Delete the todos
    const results = await Promise.allSettled(targetTodos.map(todo => api.deleteTodo(todo.id)));

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `🗑️ Deleted ${successful} task${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      deletedCount: successful,
      failedCount: failed,
    };
  }

  async bulkCreateTodos(operation) {
    const match = operation.match;
    const tasks = [];

    // Parse different creation patterns
    if (match[2]?.includes(':')) {
      // Format: "bulk add tasks: task1, task2, task3"
      const taskList = match[2].split(':')[1];
      const taskItems = taskList
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
      tasks.push(...taskItems);
    } else if (match[1]?.includes('daily')) {
      // Daily tasks template
      tasks.push('Check emails', 'Review daily goals', 'Plan tomorrow', 'Update task progress');
    } else if (match[1]?.includes('weekly')) {
      // Weekly tasks template
      tasks.push(
        'Review weekly goals',
        'Plan next week',
        'Clean up completed tasks',
        'Backup important files'
      );
    } else if (match[1]?.includes('monthly')) {
      // Monthly tasks template
      tasks.push(
        'Review monthly budget',
        'Pay monthly bills',
        'Review credit card statements',
        'Update financial goals'
      );
    }

    // Create the tasks
    const results = await Promise.allSettled(
      tasks.map(task => api.addTodo({ task, priority: 'medium' }))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `➕ Created ${successful} task${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      createdCount: successful,
      failedCount: failed,
      createdTasks: tasks.slice(0, successful),
    };
  }

  async bulkUpdateTodos(todos, operation) {
    const match = operation.match;
    let targetTodos = [];
    let updateData = {};

    // Parse update criteria and new values
    if (match[3]?.includes('priority')) {
      const priority = match[4]; // high, medium, low
      updateData.priority = priority;

      if (match[1]) {
        // Filter by criteria
        targetTodos = todos.filter(todo => {
          if (match[1].includes('overdue')) {
            return !todo.completed && todo.due_date && new Date(todo.due_date) < new Date();
          }
          return !todo.completed;
        });
      }
    } else if (match[3]?.includes('due date')) {
      const newDate = this.parseDate(match[4]);
      if (newDate) {
        updateData.due_date = newDate.toISOString().split('T')[0];
        targetTodos = todos.filter(todo => !todo.completed);
      }
    }

    // Update the todos
    const results = await Promise.allSettled(
      targetTodos.map(todo => api.updateTodo(todo.id, { ...todo, ...updateData }))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `🔄 Updated ${successful} task${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      updatedCount: successful,
      failedCount: failed,
      updateData,
    };
  }

  // Execute card bulk operations
  async executeCardBulkOperation(operation) {
    const cards = await api.getCreditCards();

    switch (operation.type) {
      case 'update':
        return await this.bulkUpdateCards(cards, operation);
      case 'analyze':
        return await this.bulkAnalyzeCards(cards, operation);
      default:
        throw new Error('Unknown card bulk operation');
    }
  }

  async bulkUpdateCards(cards, operation) {
    // Implementation for bulk card updates
    return {
      message: 'Card bulk updates are not yet implemented',
      updatedCount: 0,
    };
  }

  async bulkAnalyzeCards(cards, operation) {
    const match = operation.match;
    let analysis = {};

    if (match[1]?.includes('inactive')) {
      const inactiveCards = cards.filter(card => {
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince >= 90;
      });

      analysis = {
        type: 'inactive_analysis',
        count: inactiveCards.length,
        cards: inactiveCards.map(c => `${c.bank_name} ••${c.last_four_digits}`),
        message: `Found ${inactiveCards.length} inactive card${inactiveCards.length !== 1 ? 's' : ''}`,
      };
    } else if (match[1]?.includes('expiring')) {
      const expiringCards = cards.filter(card => {
        if (!card.current_promos || !Array.isArray(card.current_promos)) return false;
        return card.current_promos.some(promo => {
          if (!promo.promo_expiry_date) return false;
          const daysUntil = Math.floor(
            (new Date(promo.promo_expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          return daysUntil <= 30 && daysUntil >= 0;
        });
      });

      analysis = {
        type: 'expiring_analysis',
        count: expiringCards.length,
        cards: expiringCards.map(c => `${c.bank_name} ••${c.last_four_digits}`),
        message: `Found ${expiringCards.length} card${expiringCards.length !== 1 ? 's' : ''} with expiring promos`,
      };
    }

    return {
      message: analysis.message,
      analysis,
      cards: analysis.cards,
    };
  }

  // Helper method to parse dates from natural language
  parseDate(dateStr) {
    const today = new Date();
    const lowerStr = dateStr.toLowerCase();

    if (lowerStr.includes('today')) {
      return today;
    } else if (lowerStr.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (lowerStr.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    } else if (lowerStr.includes('next month')) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }

    // Try to parse as regular date
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Get available bulk operations for help
  getAvailableOperations() {
    return {
      todos: {
        complete: [
          'complete all overdue tasks',
          'mark all pending todos as done',
          'finish all high priority tasks',
        ],
        delete: ['delete all completed tasks', 'remove all done todos', 'clear completed tasks'],
        create: ['add daily tasks', 'create weekly todos', 'bulk add tasks: task1, task2, task3'],
        update: [
          'set all overdue tasks to high priority',
          'change all pending tasks due date to tomorrow',
        ],
      },
      cards: {
        analyze: [
          'show me all inactive cards',
          'analyze all cards usage',
          'find all expiring promos',
        ],
      },
    };
  }
}

export const naturalLanguageBulk = new NaturalLanguageBulkService();
