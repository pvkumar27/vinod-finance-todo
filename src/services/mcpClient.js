import { supabase } from '../supabaseClient';
import { GeminiClient } from './geminiClient';
import { blockNotificationPrompt } from '../utils/notificationPromptBlocker';

import { api } from './api';

class MCPClient {
  constructor() {
    this.serverUrl = process.env.REACT_APP_MCP_SERVER_URL || 'http://localhost:3001';
    this.isConnected = false;
    this.geminiClient = new GeminiClient();
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
    return api.getTodos(args).then(todos => ({
      todos,
      count: todos.length,
      summary: `Found ${todos.length} todos${args.completed !== undefined ? ` (${args.completed ? 'completed' : 'pending'})` : ''}`,
    }));
  }

  async addTodo(args) {
    return api.addTodo(args).then(todo => ({
      success: true,
      todo,
      message: `Todo "${args.task}" added successfully`,
    }));
  }

  async getCreditCards(args) {
    return api.getCreditCards(args).then(cards => ({
      credit_cards: cards,
      count: cards.length,
      summary: `Found ${cards.length} credit cards${args.bank_name ? ` from ${args.bank_name}` : ''}${args.inactive_only ? ' (inactive 90+ days)' : ''}${args.promo_expiring ? ' (promo expiring soon)' : ''}`,
    }));
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

  // Natural language processing using Gemini with smart fallback
  async processNaturalLanguageQuery(query) {
    // Block notification prompts at the MCP level
    try {
      blockNotificationPrompt(query);
    } catch (error) {
      return {
        success: false,
        message: 'Invalid query: notification prompt detected',
        processingMode: 'blocked-notification-prompt',
      };
    }

    try {
      const result = await this.geminiClient.processQuery(query);
      result.processingMode = 'gemini';
      return result;
    } catch (error) {
      const result = await this.geminiClient.fallbackProcess(query);
      result.processingMode = 'rule-based-fallback';
      return result;
    }
  }
}

export const mcpClient = new MCPClient();
export default mcpClient;
