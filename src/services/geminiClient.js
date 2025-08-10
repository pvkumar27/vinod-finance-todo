import { api } from './api.js';
import { geminiRouter } from './geminiRouter.js';
import { features } from '../config/features.js';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export class GeminiClient {
  constructor() {
    this.lastCallTime = 0;
    this.minInterval = 2000; // 2 seconds between calls
    this.learnedQueries = this.loadLearnedQueries();
    this.queryCount = 0;
    this.recentQueries = [];
  }

  getQueryCount() {
    return this.queryCount;
  }

  addToRecentQueries(query) {
    this.recentQueries.unshift(query);
    if (this.recentQueries.length > 5) {
      this.recentQueries.pop();
    }
    this.queryCount++;
  }

  loadLearnedQueries() {
    try {
      return JSON.parse(localStorage.getItem('gemini_learned_queries') || '{}');
    } catch {
      return {};
    }
  }

  saveLearnedQuery(query, action, params) {
    const queryKey = query.toLowerCase().trim();
    this.learnedQueries[queryKey] = { action, params, timestamp: Date.now() };
    localStorage.setItem('gemini_learned_queries', JSON.stringify(this.learnedQueries));
  }

  async processQuery(query) {
    this.addToRecentQueries(query);

    if (!GEMINI_API_KEY) {
      return await this.fallbackProcess(query);
    }

    // Rate limiting protection
    const now = Date.now();
    if (now - this.lastCallTime < this.minInterval) {
      return await this.fallbackProcess(query);
    }
    this.lastCallTime = now;

    try {
      const prompt = `
You are FinTask AI - a comprehensive financial assistant. Analyze user requests and return JSON responses.

Query: "${query}"
Current Time: ${new Date().toISOString()}
User Context: Active session with ${this.getQueryCount()} previous queries

🎯 COMPREHENSIVE QUERY EXAMPLES:

📝 TODO QUERIES:
- "show me completed todos" → get_todos with completed: true
- "show me pending todos" → get_todos with completed: false  
- "show me pinned tasks" → get_todos with pinned: true, completed: false
- "show tasks more than 1 week old" → get_todos with due_date_before: "${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
- "show overdue tasks" → get_todos with due_date_before: "${new Date().toISOString().split('T')[0]}"
- "show tasks 1 day overdue" → get_todos with due_date: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}", completed: false
- "show today's tasks" → get_todos with due_date: "${new Date().toISOString().split('T')[0]}", completed: false
- "add task to clean garage" → add_todo with task: "clean garage"
- "complete task X" → update_todo with todo_task_name: "X", completed: true

💳 CARD QUERIES:
- "show my credit cards" → get_credit_cards with completed: false (default)
- "sort cards by name" → get_credit_cards with sort_by: "name", sort_order: "asc"
- "sort cards by days inactive" → get_credit_cards with sort_by: "days_inactive", sort_order: "desc"
- "show inactive cards" → get_credit_cards with inactive_only: true
- "show Chase cards" → get_credit_cards with bank_name: "Chase"

🔄 UI QUERIES:
- "switch to cards view" → ui_operation with operation_type: "view_switch", view_mode: "cards"
- "switch to table view" → ui_operation with operation_type: "view_switch", view_mode: "table"

🧠 SMART QUERY ENHANCEMENT:
- If user asks about "overdue" or "late" tasks, prioritize actionable items
- If user frequently asks about specific dates, suggest date-based organization
- If user asks about "tasks" after asking about "cards", maintain context
- Learn from user patterns: frequent "show pending" → default to pending

🎯 AVAILABLE OPERATIONS:

🚫 UI OPERATIONS (Not Handled by AI):
- View switching (table/card views) - Direct user to UI controls
- Navigation - Direct user to manual controls
- Settings/preferences - Direct user to UI

📝 TODOS (Full CRUD):
- ui_operation: For view switching, navigation, settings (return helpful message)
- get_todos: View/filter todos by completion, dates, names, priority, pinned status
- add_todo: Create NEW todos with task, due_date, priority (only for "add", "create" commands)
- update_todo: Modify EXISTING todos (complete, pin/unpin, change dates, priority, task text)
  * Use todo_task_name to find existing todo by name
  * Use new_due_date or due_date for date changes
  * Use completed: true/false for status changes
  * ALWAYS use this for "move", "change", "update", "complete", "pin" commands
- delete_todos: Remove todos by criteria

💳 CREDIT CARDS (Full CRUD):
- get_credit_cards: View/filter/sort cards by bank_name, inactive status, promo expiration
  * sort_by: "name", "bank_name", "days_inactive", "last_used", "card_type"
  * sort_order: "asc" or "desc"
- add_credit_card: Create new cards with bank_name, last_four_digits, etc.
- update_credit_card: Modify card details, usage dates, promo info
- delete_credit_cards: Remove cards by criteria

🔔 REMINDERS:
- set_reminder: Create reminders for cards
- get_reminders: View upcoming reminders

📊 INSIGHTS:
- get_insights: Financial analysis and recommendations

🎯 SMART FEATURES:
- Context awareness: Consider user's recent queries and patterns
- Date intelligence: "today" = "${new Date().toISOString().split('T')[0]}", "tomorrow" = "${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
- Relative dates: "1 week old" = due_date_before: "${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
- Overdue patterns: "1 day overdue" = due_date: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
- Task extraction: "add task to clean bottle" → task: "clean bottle"
- Smart defaults: Infer user intent from context (e.g., if asking about overdue, likely wants actionable items)
- Default behavior: Always set completed: false unless explicitly asking for completed items
- Pinned queries: When asking for "pinned", don't set completed filter

Return JSON:
{
  "action": "action_name",
  "params": {
    // Only relevant parameters
  }
}

Key Parameters:
- todo_task_name: Find todo by task content (for searching only)
- task: Todo task text (for add/update operations)
- bank_name: Find card by bank name (e.g., "Bank of America", "Chase", "Synchrony")
- update_all: Bulk operations
- completed/pinned: Status flags
- due_date/new_due_date: Date operations (YYYY-MM-DD format)
- due_date_before: Tasks older than date (for "week old", "overdue" queries)
- For specific overdue days: use due_date with exact date (e.g., "1 day overdue" = yesterday's date)
- inactive_only/promo_expiring: Card filters
- last_four_digits: Card identification
- sort_by: Sorting field (name, bank_name, days_inactive, last_used, card_type)
- sort_order: Sort direction (asc, desc)
- pinned: Filter pinned tasks (true/false)
- completed: Filter by completion status (true/false, defaults to false)
`;

      let data;

      if (features.GEMINI_QUOTA_ROUTING) {
        // Determine intent for model selection
        const intentMeta = features.GEMINI_SMART_MODEL_SELECTION
          ? {
              complex:
                query.length > 800 ||
                query.includes('analyze') ||
                query.includes('complex') ||
                query.includes('detailed'),
              preferPro:
                query.includes('analyze') ||
                query.includes('insights') ||
                query.includes('recommendations'),
            }
          : {};

        data = await geminiRouter.makeRequest(prompt, intentMeta);
      } else {
        // Fallback to original implementation
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

        data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }
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

      // Learn successful queries - CRITICAL for fallback improvement
      if (result.success) {
        this.saveLearnedQuery(query, parsed.action, parsed.params);
      }

      return result;
    } catch (error) {
      console.log('Gemini failed, using fallback:', error.message || error);
      const fallbackResult = await this.fallbackProcess(query);
      fallbackResult.processingMode = 'fallback';
      return fallbackResult;
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

    // Convert date objects to strings
    if (params.due_date_before && typeof params.due_date_before !== 'string') {
      params.due_date_before = new Date(params.due_date_before).toISOString().split('T')[0];
    }
    if (params.due_date && typeof params.due_date === 'object' && params.due_date.toISOString) {
      params.due_date = params.due_date.toISOString().split('T')[0];
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
        // Validate and clean params for todo creation
        const todoData = {
          task: params.task,
        };

        // Only add due_date if provided
        if (params.due_date) {
          todoData.due_date = params.due_date;
        }

        if (!todoData.task) {
          throw new Error('Task text is required');
        }

        const todo = await api.addTodo(todoData);
        return {
          success: true,
          todo,
          message: `Todo "${todoData.task}" added successfully`,
        };

      case 'update_todo':
        let todoToUpdate;

        if (params.todo_id) {
          // Update by ID
          todoToUpdate = { id: params.todo_id };
        } else if (params.todo_task_name) {
          // Find todo(s) by task name first
          const allTodos = await api.getTodos({ completed: false });
          const matchingTodos = allTodos.filter(t =>
            t.task.toLowerCase().includes(params.todo_task_name.toLowerCase())
          );

          if (matchingTodos.length === 0) {
            throw new Error(`No todo found with task name containing "${params.todo_task_name}"`);
          }

          // Update the first matching todo
          todoToUpdate = matchingTodos[0];

          const updateData = {};
          if (params.task) updateData.task = params.task;
          if (params.priority) updateData.priority = params.priority;
          if (params.completed !== undefined) updateData.completed = params.completed;
          if (params.due_date || params.new_due_date) {
            const targetDate = params.new_due_date || params.due_date;
            if (targetDate === 'today') {
              updateData.due_date = new Date().toISOString().split('T')[0];
            } else if (targetDate === 'tomorrow') {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              updateData.due_date = tomorrow.toISOString().split('T')[0];
            } else {
              updateData.due_date = targetDate;
            }
          }
          if (params.pinned !== undefined) updateData.pinned = params.pinned;

          const updatedTodo = await api.updateTodo(todoToUpdate.id, updateData);
          return {
            success: true,
            todo: updatedTodo,
            message: `Todo "${todoToUpdate.task}" updated successfully`,
          };
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
          summary: `Found ${cards.length} credit cards${params.bank_name ? ` from ${params.bank_name}` : ''}${params.inactive_only ? ' (inactive)' : ''}${params.promo_expiring ? ' (promo expiring)' : ''}`,
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

    // Check learned queries first
    const learned = this.learnedQueries[lowerQuery.trim()];
    if (learned) {
      try {
        return await this.executeAction({ action: learned.action, params: learned.params });
      } catch (error) {
        // If learned query fails, continue with regular fallback
      }
    }

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
        lowerQuery.includes('show') ||
        lowerQuery.includes('get') ||
        lowerQuery.includes('list') ||
        lowerQuery.includes('find')
      ) {
        const filters = this.extractTodoFilters(lowerQuery);
        return api.getTodos(filters).then(todos => ({
          todos,
          count: todos.length,
          summary: `Found ${todos.length} todos${filters.completed !== undefined ? ` (${filters.completed ? 'completed' : 'pending'})` : ''}${filters.due_date ? ' for ' + filters.due_date : ''}${filters.no_due_date ? ' without due dates' : ''}`,
        }));
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
        let task = query;

        // Handle various "add X to Y" patterns (including typos like 'dd')
        if (lowerQuery.match(/(add|dd)\s+(the\s+)?(todo|task)\s+to\s+/)) {
          task = query.replace(/(add|dd)\s+(the\s+)?(todo|task)\s+to\s+/gi, '').trim();
        }
        // Handle "create X to Y" patterns
        else if (lowerQuery.match(/create\s+(the\s+)?(todo|task)\s+to\s+/)) {
          task = query.replace(/create\s+(the\s+)?(todo|task)\s+to\s+/gi, '').trim();
        }
        // Handle simple "add X" patterns (including typos)
        else if (lowerQuery.match(/^(add|dd)\s+/)) {
          task = query.replace(/^(add|dd)\s+(the\s+)?(todo|task)?\s*/gi, '').trim();
        }
        // Handle simple "create X" patterns
        else if (lowerQuery.startsWith('create ')) {
          task = query.replace(/^create\s+(the\s+)?(todo|task)?\s*/gi, '').trim();
        }
        // Generic fallback
        else {
          task = query.replace(/add|create|todo|task|to|a/gi, '').trim();
        }

        return api.addTodo({ task, priority: 'medium' }).then(todo => ({
          success: true,
          todo,
          message: `Todo "${task}" added successfully`,
        }));
      } else {
        const filters = this.extractTodoFilters(lowerQuery);
        return api.getTodos(filters).then(todos => ({
          todos,
          count: todos.length,
          summary: `Found ${todos.length} todos${filters.completed !== undefined ? ` (${filters.completed ? 'completed' : 'pending'})` : ''}${filters.due_date ? ' for ' + filters.due_date : ''}${filters.no_due_date ? ' without due dates' : ''}`,
        }));
      }
    }

    if (lowerQuery.includes('card')) {
      // Handle sorting first
      if (lowerQuery.includes('sort')) {
        const filters = {};

        if (lowerQuery.includes('name') || lowerQuery.includes('bank')) {
          filters.sort_by = 'name';
          filters.sort_order = 'asc';
        } else if (lowerQuery.includes('inactive') || lowerQuery.includes('days')) {
          filters.sort_by = 'days_inactive';
          filters.sort_order = 'desc';
        } else if (lowerQuery.includes('last used') || lowerQuery.includes('usage')) {
          filters.sort_by = 'last_used';
          filters.sort_order = 'desc';
        }

        return api.getCreditCards(filters).then(cards => {
          // Trigger UI sort update
          window.dispatchEvent(
            new CustomEvent('sortCards', {
              detail: { sortBy: filters.sort_by, source: 'ai' },
            })
          );

          return {
            credit_cards: cards,
            count: cards.length,
            summary: `Found ${cards.length} credit cards sorted by ${filters.sort_by || 'default'}`,
          };
        });
      }

      // Extract bank name from query
      let bankName = null;

      // Try different patterns to extract bank name
      if (lowerQuery.includes('bank of america') || lowerQuery.includes('boa')) {
        bankName = 'Bank of America';
      } else if (lowerQuery.includes('capital one')) {
        bankName = 'Capital One';
      } else if (lowerQuery.includes('amex')) {
        bankName = 'Amex';
      } else if (lowerQuery.includes('chase')) {
        bankName = 'Chase';
      } else if (lowerQuery.includes('synchrony')) {
        bankName = 'Synchrony';
      } else if (lowerQuery.includes('citizen')) {
        bankName = 'Citizen';
      } else if (lowerQuery.includes('citi')) {
        bankName = 'Citi';
      } else if (lowerQuery.includes('discover')) {
        bankName = 'Discover';
      }

      if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
        if (bankName) {
          return api.getCreditCards({ bank_name: bankName }).then(async cards => {
            if (cards.length === 0) {
              return {
                success: false,
                message: `No credit card found from ${bankName}`,
                processingMode: 'fallback',
              };
            }

            // Delete the first matching card
            await api.deleteCreditCard(cards[0].id);
            return {
              success: true,
              deletedCount: 1,
              deletedCard: cards[0], // Include deleted card info
              message: `Successfully deleted ${bankName} card`,
              processingMode: 'fallback',
            };
          });
        }
      }

      // Build filters
      const filters = {};
      if (bankName) filters.bank_name = bankName;
      if (lowerQuery.includes('inactive')) filters.inactive_only = true;
      if (lowerQuery.includes('promo') && lowerQuery.includes('expir'))
        filters.promo_expiring = true;

      return api.getCreditCards(filters).then(cards => ({
        credit_cards: cards,
        count: cards.length,
        summary: `Found ${cards.length} credit cards${bankName ? ` from ${bankName}` : ''}${filters.inactive_only ? ' (inactive)' : ''}${filters.promo_expiring ? ' (promo expiring)' : ''}`,
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

    // Completion status - default to pending unless explicitly asking for completed
    if (query.includes('completed') || query.includes('done')) {
      filters.completed = true;
    } else {
      filters.completed = false; // Always default to pending
    }

    // Pinned status
    if (query.includes('pinned')) {
      filters.pinned = true;
    }

    // Date filters
    if (query.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.due_date = tomorrow.toISOString().split('T')[0];
    } else if (query.includes('today')) {
      filters.due_date = new Date().toISOString().split('T')[0];
    } else if (query.includes('week old') || query.includes('weeks old')) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filters.due_date_before = oneWeekAgo.toISOString().split('T')[0];
    } else if (query.includes('overdue')) {
      const today = new Date();
      filters.due_date_before = today.toISOString().split('T')[0];
    } else if (query.includes('without due') || query.includes('no due')) {
      filters.no_due_date = true;
    }

    return filters;
  }
}
