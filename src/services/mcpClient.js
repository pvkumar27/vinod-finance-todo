import { supabase } from '../supabaseClient';

class MCPClient {
  constructor() {
    this.serverUrl = process.env.REACT_APP_MCP_SERVER_URL || 'http://localhost:3001';
    this.isConnected = false;
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async callTool(toolName, args = {}) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Add user_id to all tool calls
      const toolArgs = { ...args, user_id: user.id };

      // For now, we'll simulate MCP calls by directly calling our existing services
      // In a full implementation, this would make HTTP requests to the MCP server
      return await this.simulateToolCall(toolName, toolArgs);
    } catch (error) {
      console.error(`MCP Tool Error (${toolName}):`, error);
      throw error;
    }
  }

  // Simulate MCP tool calls using existing services
  async simulateToolCall(toolName, args) {
    switch (toolName) {
      case 'get_todos':
        return await this.getTodos(args);
      case 'add_todo':
        return await this.addTodo(args);
      case 'get_credit_cards':
        return await this.getCreditCards(args);
      case 'analyze_spending':
        return await this.analyzeSpending(args);
      case 'get_financial_insights':
        return await this.getFinancialInsights(args);
      case 'search_transactions':
        return await this.searchTransactions(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async getTodos(args) {
    let query = supabase.from('todos').select('*');

    if (args.completed !== undefined) {
      query = query.eq('completed', args.completed);
    }

    if (args.priority) {
      query = query.eq('priority', args.priority);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      todos: data,
      count: data.length,
      summary: `Found ${data.length} todos${args.completed !== undefined ? ` (${args.completed ? 'completed' : 'pending'})` : ''}`,
    };
  }

  async addTodo(args) {
    const todoData = {
      task: args.task,
      due_date: args.due_date || new Date().toISOString().split('T')[0],
      completed: false,
    };

    const { data, error } = await supabase.from('todos').insert([todoData]).select();

    if (error) throw error;

    return {
      success: true,
      todo: data[0],
      message: `Todo "${args.task}" added successfully`,
    };
  }

  async getCreditCards(args) {
    let query = supabase.from('credit_cards_manual').select('*');
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    let filteredData = data || [];

    // Filter for inactive cards (90+ days)
    if (args.inactive_only) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      filteredData = filteredData.filter(card => {
        if (!card.last_transaction_date) return true;
        return new Date(card.last_transaction_date) < ninetyDaysAgo;
      });
    }

    // Filter for expiring promos
    if (args.promo_expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      filteredData = filteredData.filter(card => {
        if (!card.promo_end_date) return false;
        return new Date(card.promo_end_date) <= thirtyDaysFromNow;
      });
    }

    return {
      credit_cards: filteredData,
      count: filteredData.length,
      summary: `Found ${filteredData.length} credit cards${args.inactive_only ? ' (inactive 90+ days)' : ''}${args.promo_expiring ? ' (promo expiring soon)' : ''}`,
    };
  }

  async analyzeSpending(args) {
    throw new Error('Spending analysis not available yet. Please add transaction data first.');
  }

  async getFinancialInsights(args) {
    throw new Error('Financial insights not available yet. Please add transaction data first.');
  }

  async searchTransactions(args) {
    throw new Error('Transaction search not available yet. Please add transaction data first.');
  }

  // Natural language processing helpers
  async processNaturalLanguageQuery(query) {
    const lowerQuery = query.toLowerCase();

    // Todo queries
    if (lowerQuery.includes('todo') || lowerQuery.includes('task')) {
      if (lowerQuery.includes('add') || lowerQuery.includes('create')) {
        const task = this.extractTaskFromQuery(query);
        return await this.callTool('add_todo', { task });
      } else {
        const filters = this.extractTodoFilters(query);
        return await this.callTool('get_todos', filters);
      }
    }

    // Credit card queries
    if (lowerQuery.includes('card') || lowerQuery.includes('credit')) {
      const filters = this.extractCardFilters(query);
      return await this.callTool('get_credit_cards', filters);
    }

    // Spending queries - not available yet
    if (
      lowerQuery.includes('spend') ||
      lowerQuery.includes('expense') ||
      lowerQuery.includes('transaction')
    ) {
      throw new Error(
        'Spending and transaction features not available yet. I can help with todos and credit cards.'
      );
    }

    // Financial insights - not available yet
    if (
      lowerQuery.includes('insight') ||
      lowerQuery.includes('financial') ||
      lowerQuery.includes('recommend')
    ) {
      throw new Error(
        'Financial insights not available yet. I can help with todos and credit cards.'
      );
    }

    // Default fallback
    throw new Error(
      'I can help with todos and credit cards. Try asking: "Show me my todos" or "Show me my credit cards"'
    );
  }

  extractTaskFromQuery(query) {
    // Handle patterns like "add a todo to clean the garage"
    const lowerQuery = query.toLowerCase();

    // Remove common prefixes
    if (lowerQuery.startsWith('add a todo to ')) {
      return query.substring(14); // Remove "add a todo to "
    }
    if (lowerQuery.startsWith('create a todo to ')) {
      return query.substring(17); // Remove "create a todo to "
    }
    if (lowerQuery.startsWith('add todo to ')) {
      return query.substring(12); // Remove "add todo to "
    }
    if (lowerQuery.startsWith('add task to ')) {
      return query.substring(12); // Remove "add task to "
    }

    // Fallback to original logic
    const addWords = ['add', 'create', 'new'];
    const words = query.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (addWords.includes(words[i].toLowerCase())) {
        return words.slice(i + 1).join(' ');
      }
    }

    return query;
  }

  extractTodoFilters(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('completed') || lowerQuery.includes('done')) {
      filters.completed = true;
    } else if (lowerQuery.includes('pending') || lowerQuery.includes('incomplete')) {
      filters.completed = false;
    }

    if (lowerQuery.includes('high priority')) {
      filters.priority = 'high';
    } else if (lowerQuery.includes('low priority')) {
      filters.priority = 'low';
    }

    return filters;
  }

  extractCardFilters(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('inactive') || lowerQuery.includes('unused')) {
      filters.inactive_only = true;
    }

    if (lowerQuery.includes('promo') || lowerQuery.includes('expir')) {
      filters.promo_expiring = true;
    }

    return filters;
  }

  extractPeriod(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('week')) return 'week';
    if (lowerQuery.includes('month')) return 'month';
    if (lowerQuery.includes('quarter')) return 'quarter';
    if (lowerQuery.includes('year')) return 'year';

    return 'month'; // default
  }
}

export const mcpClient = new MCPClient();
export default mcpClient;
