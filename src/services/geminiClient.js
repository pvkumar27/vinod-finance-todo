import { api } from './api.js';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export class GeminiClient {
  async processQuery(query) {
    if (!GEMINI_API_KEY) {
      return await this.fallbackProcess(query);
    }
    try {
      const prompt = `
You are FinTask AI - a comprehensive financial assistant. Analyze user requests and return JSON responses.

Query: "${query}"

🎯 AVAILABLE OPERATIONS:

🚫 UI OPERATIONS (Not Handled by AI):
- View switching (table/card views) - Direct user to UI controls
- Navigation - Direct user to manual controls
- Settings/preferences - Direct user to UI

📝 TODOS (Full CRUD):
- ui_operation: For view switching, navigation, settings (return helpful message)
- get_todos: View/filter todos by completion, dates, names, priority, pinned status
- add_todo: Create new todos with task, due_date, priority
- update_todo: Modify todos (complete, pin/unpin, change dates, priority, task text)
- delete_todos: Remove todos by criteria

💳 CREDIT CARDS (Full CRUD):
- get_credit_cards: View/filter cards by name, inactive status, promo expiration
- add_credit_card: Create new cards with bank_name, last_four_digits, etc.
- update_credit_card: Modify card details, usage dates, promo info
- delete_credit_cards: Remove cards by criteria

🔔 REMINDERS:
- set_reminder: Create reminders for cards
- get_reminders: View upcoming reminders

📊 INSIGHTS:
- get_insights: Financial analysis and recommendations

🎯 SMART FEATURES:
- Bulk operations with "all" keyword
- Date intelligence (today, tomorrow, next week)
- Natural language task/card matching
- Priority and status management

Return JSON:
{
  "action": "action_name",
  "params": {
    // Only relevant parameters
  }
}

Key Parameters:
- todo_task_name/card_name: Find by name/content
- update_all: Bulk operations
- completed/pinned: Status flags
- due_date/new_due_date: Date operations
- inactive_only/promo_expiring: Card filters
- bank_name/last_four_digits: Card identification
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.candidates || !data.candidates[0]) {
        throw new Error('No response from Gemini');
      }

      const text = data.candidates[0].content.parts[0].text;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      const result = await this.executeAction(parsed);
      result.processingMode = 'gemini';
      return result;
    } catch (error) {
      return await this.fallbackProcess(query);
    }
  }

  async executeAction({ action, params }) {
    // Convert relative dates
    if (params.due_date === 'today') {
      params.due_date = new Date().toISOString().split('T')[0];
    } else if (params.due_date === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      params.due_date = tomorrow.toISOString().split('T')[0];
    }

    switch (action) {
      case 'ui_operation':
        if (params.operation_type === 'view_switch') {
          return {
            success: true,
            ui_action: 'switch_view',
            view_mode: params.view_mode || 'table',
            message: `Switched to ${params.view_mode || 'table'} view`,
          };
        }
        return {
          success: false,
          message: 'This operation should be done using the user interface controls.',
          ui_guidance: true,
        };

      case 'get_todos':
        const todos = await api.getTodos(params);
        return {
          todos,
          count: todos.length,
          summary: `Found ${todos.length} todos${params.completed !== undefined ? ` (${params.completed ? 'completed' : 'pending'})` : ''}`,
        };

      case 'add_todo':
        const todo = await api.addTodo(params);
        return {
          success: true,
          todo,
          message: `Todo "${params.task}" added successfully`,
        };

      case 'update_todo':
        let todoToUpdate;

        if (params.todo_id) {
          // Update by ID
          todoToUpdate = { id: params.todo_id };
        } else if (params.due_date && params.update_all) {
          // Bulk update by due date
          const filterParams = { completed: false };
          if (params.due_date === 'today') {
            filterParams.due_date = new Date().toISOString().split('T')[0];
          } else if (params.due_date === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            filterParams.due_date = tomorrow.toISOString().split('T')[0];
          } else {
            filterParams.due_date = params.due_date;
          }

          const todosToUpdate = await api.getTodos(filterParams);
          if (todosToUpdate.length === 0) {
            throw new Error(`No todos found for ${params.due_date}`);
          }

          const updateData = {};
          if (params.new_due_date) {
            if (params.new_due_date === 'today') {
              updateData.due_date = new Date().toISOString().split('T')[0];
            } else if (params.new_due_date === 'tomorrow') {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              updateData.due_date = tomorrow.toISOString().split('T')[0];
            } else {
              updateData.due_date = params.new_due_date;
            }
          }
          if (params.completed !== undefined) updateData.completed = params.completed;
          if (params.priority) updateData.priority = params.priority;

          let updatedCount = 0;
          for (const todo of todosToUpdate) {
            await api.updateTodo(todo.id, updateData);
            updatedCount++;
          }

          return {
            success: true,
            updatedCount,
            message: `Successfully moved ${updatedCount} todo${updatedCount > 1 ? 's' : ''} from ${params.due_date} to ${params.new_due_date || 'updated status'}`,
          };
        } else if (params.todo_task_name) {
          // Find todo(s) by task name
          const allTodos = await api.getTodos({ completed: false });
          const matchingTodos = allTodos.filter(t =>
            t.task.toLowerCase().includes(params.todo_task_name.toLowerCase())
          );

          if (matchingTodos.length === 0) {
            throw new Error(`No todo found with task name containing "${params.todo_task_name}"`);
          }

          if (params.update_all) {
            // Update all matching todos
            const updateData = {};
            if (params.task) updateData.task = params.task;
            if (params.priority) updateData.priority = params.priority;
            if (params.completed !== undefined) updateData.completed = params.completed;
            if (params.due_date) updateData.due_date = params.due_date;
            if (params.pinned !== undefined) updateData.pinned = params.pinned;

            let updatedCount = 0;
            for (const todo of matchingTodos) {
              await api.updateTodo(todo.id, updateData);
              updatedCount++;
            }

            return {
              success: true,
              updatedCount,
              message: `Successfully updated ${updatedCount} todo${updatedCount > 1 ? 's' : ''} matching "${params.todo_task_name}"`,
            };
          } else {
            // Update only first matching todo
            todoToUpdate = matchingTodos[0];
          }
        } else {
          throw new Error('Todo ID or task name is required for updates');
        }

        const updateData = {};
        if (params.task) updateData.task = params.task;
        if (params.priority) updateData.priority = params.priority;
        if (params.completed !== undefined) updateData.completed = params.completed;
        if (params.due_date) updateData.due_date = params.due_date;
        if (params.pinned !== undefined) updateData.pinned = params.pinned;

        const updatedTodo = await api.updateTodo(todoToUpdate.id, updateData);
        return {
          success: true,
          todo: updatedTodo,
          message: `Todo updated successfully`,
        };

      case 'delete_todos':
        const todosToDelete = await api.getTodos(params);
        if (todosToDelete.length === 0) {
          return {
            success: false,
            message: 'No todos found matching the criteria',
          };
        }

        let deletedCount = 0;
        for (const todoItem of todosToDelete) {
          await api.deleteTodo(todoItem.id);
          deletedCount++;
        }

        return {
          success: true,
          deletedCount,
          message: `Successfully deleted ${deletedCount} todo${deletedCount > 1 ? 's' : ''}`,
        };

      case 'get_credit_cards':
        const cards = await api.getCreditCards(params);
        return {
          credit_cards: cards,
          count: cards.length,
          summary: `Found ${cards.length} credit cards${params.card_name ? ` matching "${params.card_name}"` : ''}${params.inactive_only ? ' (inactive)' : ''}${params.promo_expiring ? ' (promo expiring)' : ''}`,
        };

      case 'add_credit_card':
        const newCard = await api.addCreditCard(params);
        return {
          success: true,
          credit_card: newCard,
          message: `Credit card "${params.card_name}" added successfully`,
        };

      case 'update_credit_card':
        if (!params.card_id) {
          throw new Error('Card ID is required for updates');
        }

        const cardUpdateData = {};
        if (params.card_name) cardUpdateData.card_name = params.card_name;
        if (params.card_type) cardUpdateData.card_type = params.card_type;
        if (params.credit_limit) cardUpdateData.credit_limit = params.credit_limit;

        const updatedCard = await api.updateCreditCard(params.card_id, cardUpdateData);
        return {
          success: true,
          credit_card: updatedCard,
          message: `Credit card updated successfully`,
        };

      case 'delete_credit_cards':
        const cardsToDelete = await api.getCreditCards(params);
        if (cardsToDelete.length === 0) {
          return {
            success: false,
            message: 'No credit cards found matching the criteria',
          };
        }

        let deletedCardCount = 0;
        for (const card of cardsToDelete) {
          await api.deleteCreditCard(card.id);
          deletedCardCount++;
        }

        return {
          success: true,
          deletedCount: deletedCardCount,
          message: `Successfully deleted ${deletedCardCount} credit card${deletedCardCount > 1 ? 's' : ''}`,
        };

      case 'get_insights':
        const allTodos = await api.getTodos({});
        const allCards = await api.getCreditCards({});

        const insights = [];
        const recommendations = [];

        // Todo insights
        const overdueTodos = allTodos.filter(
          t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
        );
        const completedTodos = allTodos.filter(t => t.completed);

        if (overdueTodos.length > 0) {
          insights.push(`${overdueTodos.length} overdue todos`);
          recommendations.push('Focus on completing overdue tasks first');
        }

        if (completedTodos.length > 0) {
          insights.push(`${completedTodos.length} completed todos this period`);
        }

        // Card insights
        const inactiveCards = allCards.filter(c => {
          if (!c.last_used_date) return true;
          const daysSince = Math.floor(
            (new Date() - new Date(c.last_used_date)) / (1000 * 60 * 60 * 24)
          );
          return daysSince > 90;
        });

        if (inactiveCards.length > 0) {
          insights.push(`${inactiveCards.length} inactive credit cards`);
          recommendations.push('Consider using inactive cards or closing them');
        }

        return {
          insights,
          recommendations,
          summary: `Financial overview: ${insights.length} key insights found`,
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async fallbackProcess(query) {
    const lowerQuery = query.toLowerCase();

    // Handle UI operations first (before todo/card processing)
    if (
      lowerQuery.includes('switch') &&
      (lowerQuery.includes('table') || lowerQuery.includes('card') || lowerQuery.includes('view'))
    ) {
      const viewMode = lowerQuery.includes('table') ? 'table' : 'cards';
      return {
        success: true,
        ui_action: 'switch_view',
        view_mode: viewMode,
        message: `Switched to ${viewMode} view`,
        processingMode: 'fallback',
      };
    }

    if (lowerQuery.includes('todo') || lowerQuery.includes('task')) {
      if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
        const filters = this.extractTodoFilters(lowerQuery);
        const todosToDelete = await api.getTodos(filters);

        if (todosToDelete.length === 0) {
          return {
            success: false,
            message: 'No todos found matching the criteria',
            processingMode: 'fallback',
          };
        }

        let deletedCount = 0;
        for (const todoItem of todosToDelete) {
          await api.deleteTodo(todoItem.id);
          deletedCount++;
        }

        return {
          success: true,
          deletedCount,
          message: `Successfully deleted ${deletedCount} todo${deletedCount > 1 ? 's' : ''}`,
          processingMode: 'fallback',
        };
      } else if (
        lowerQuery.includes('update') ||
        lowerQuery.includes('change') ||
        lowerQuery.includes('mark') ||
        lowerQuery.includes('complete') ||
        lowerQuery.includes('move') ||
        lowerQuery.includes('pin') ||
        lowerQuery.includes('unpin')
      ) {
        // Handle date-based moves first
        if (
          lowerQuery.includes('move') &&
          (lowerQuery.includes('today') || lowerQuery.includes('tomorrow'))
        ) {
          let filterParams = { completed: false };
          let newDueDate = null;

          // Determine source date
          if (lowerQuery.includes('today')) {
            filterParams.due_date = new Date().toISOString().split('T')[0];
          }

          // Determine target date
          if (lowerQuery.includes('to tomorrow') || lowerQuery.includes('tomorrow')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            newDueDate = tomorrow.toISOString().split('T')[0];
          }

          if (newDueDate) {
            const todosToMove = await api.getTodos(filterParams);
            if (todosToMove.length === 0) {
              return {
                success: false,
                message: 'No todos found for today',
                processingMode: 'fallback',
              };
            }

            let updatedCount = 0;
            for (const todo of todosToMove) {
              await api.updateTodo(todo.id, { due_date: newDueDate });
              updatedCount++;
            }

            return {
              success: true,
              updatedCount,
              message: `Successfully moved ${updatedCount} todo${updatedCount > 1 ? 's' : ''} to tomorrow`,
              processingMode: 'fallback',
            };
          }
        }

        // Try to extract task name and action
        const allTodos = await api.getTodos({ completed: false });

        // Look for task name in the query
        const matchingTodos = [];
        for (const todo of allTodos) {
          if (lowerQuery.includes(todo.task.toLowerCase())) {
            matchingTodos.push(todo);
            if (!lowerQuery.includes('all')) break; // Only find first match unless 'all' is specified
          }
        }

        if (matchingTodos.length === 0) {
          return {
            success: false,
            message: 'Could not find a matching todo. Please be more specific or use the todo ID.',
            processingMode: 'fallback',
          };
        }

        // Determine what to update
        const updateData = {};
        if (lowerQuery.includes('complete') || lowerQuery.includes('done')) {
          updateData.completed = true;
        }
        if (lowerQuery.includes('pin') && !lowerQuery.includes('unpin')) {
          updateData.pinned = true;
        } else if (lowerQuery.includes('unpin')) {
          updateData.pinned = false;
        }
        if (lowerQuery.includes('high priority')) {
          updateData.priority = 'high';
        } else if (lowerQuery.includes('low priority')) {
          updateData.priority = 'low';
        }

        // Update all matching todos
        let updatedCount = 0;
        for (const todo of matchingTodos) {
          await api.updateTodo(todo.id, updateData);
          updatedCount++;
        }

        return {
          success: true,
          updatedCount,
          message: `Successfully updated ${updatedCount} todo${updatedCount > 1 ? 's' : ''}`,
          processingMode: 'fallback',
        };
      } else if (lowerQuery.includes('add') || lowerQuery.includes('create')) {
        const task = query.replace(/add|create|todo|task|to|a/gi, '').trim();
        return api.addTodo({ task, priority: 'medium' }).then(todo => ({
          success: true,
          todo,
          message: `Todo "${task}" added successfully`,
          processingMode: 'fallback',
        }));
      } else {
        const filters = this.extractTodoFilters(lowerQuery);
        return api.getTodos(filters).then(todos => ({
          todos,
          count: todos.length,
          summary: `Found ${todos.length} todos${filters.completed !== undefined ? ` (${filters.completed ? 'completed' : 'pending'})` : ''}${filters.due_date ? ' for ' + filters.due_date : ''}${filters.no_due_date ? ' without due dates' : ''}`,
          processingMode: 'fallback',
        }));
      }
    }

    if (lowerQuery.includes('card')) {
      if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
        // Extract card name from query
        let cardName = null;

        // Try different patterns to extract card name
        if (lowerQuery.includes('capital one')) {
          cardName = 'capital one';
        } else if (lowerQuery.includes('amex')) {
          cardName = 'amex';
        } else if (lowerQuery.includes('chase')) {
          cardName = 'chase';
        } else if (lowerQuery.includes('synchrony')) {
          cardName = 'synchrony';
        } else if (lowerQuery.includes('citizen')) {
          cardName = 'citizen';
        } else {
          // Generic pattern matching
          const match = lowerQuery.match(/(?:delete|remove)\s+(?:the\s+)?([\w\s]+?)\s+card/);
          cardName = match && match[1] ? match[1].trim() : null;
        }

        if (cardName) {
          return api.getCreditCards({ card_name: cardName }).then(async cards => {
            if (cards.length === 0) {
              return {
                success: false,
                message: `No credit card found matching "${cardName}"`,
                processingMode: 'fallback',
              };
            }

            // Delete the first matching card
            await api.deleteCreditCard(cards[0].id);
            return {
              success: true,
              deletedCount: 1,
              deletedCard: cards[0], // Include deleted card info
              message: `Successfully deleted ${cards[0].card_name || 'credit card'}`,
              processingMode: 'fallback',
            };
          });
        }
      }

      return api.getCreditCards({}).then(cards => ({
        credit_cards: cards,
        count: cards.length,
        summary: `Found ${cards.length} credit cards`,
        processingMode: 'fallback',
      }));
    }

    // Handle common update patterns that might not be caught
    if (lowerQuery.includes('mark') || lowerQuery.includes('complete')) {
      return {
        success: false,
        message:
          'To mark a todo as completed, try: "mark [task name] as completed" or "complete [task name]"',
        processingMode: 'fallback',
      };
    }

    if (lowerQuery.includes('pin')) {
      return {
        success: false,
        message: 'To pin a todo, try: "pin [task name]" or "pin the [task name] task"',
        processingMode: 'fallback',
      };
    }

    throw new Error(
      'I can help with todos and credit cards. Try: "show my todos" or "show my credit cards"'
    );
  }

  extractTodoFilters(query) {
    const filters = {};

    // Completion status
    if (query.includes('completed') || query.includes('done')) {
      filters.completed = true;
    } else {
      filters.completed = false; // Default to pending
    }

    // Date filters
    if (query.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.due_date = tomorrow.toISOString().split('T')[0];
    } else if (query.includes('today')) {
      filters.due_date = new Date().toISOString().split('T')[0];
    } else if (query.includes('without due') || query.includes('no due')) {
      filters.no_due_date = true;
    }

    return filters;
  }
}
