#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class FinTaskMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'fintask-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = error => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_todos',
          description: 'Get all todos for a user with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              user_id: { type: 'string', description: 'User ID to filter todos' },
              completed: { type: 'boolean', description: 'Filter by completion status' },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Filter by priority',
              },
            },
          },
        },
        {
          name: 'add_todo',
          description: 'Add a new todo item',
          inputSchema: {
            type: 'object',
            properties: {
              user_id: { type: 'string', description: 'User ID' },
              task: { type: 'string', description: 'Todo task description' },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Task priority',
              },
              due_date: { type: 'string', description: 'Due date in ISO format' },
            },
            required: ['user_id', 'task'],
          },
        },
        {
          name: 'get_credit_cards',
          description: 'Get all credit cards for a user with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              user_id: { type: 'string', description: 'User ID to filter cards' },
              bank_name: {
                type: 'string',
                description: 'Filter by bank name (e.g., "Bank of America", "Chase")',
              },
              inactive_only: {
                type: 'boolean',
                description: 'Show only inactive cards (90+ days)',
              },
              promo_expiring: { type: 'boolean', description: 'Show cards with expiring promos' },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_todos':
            return await this.getTodos(args);
          case 'add_todo':
            return await this.addTodo(args);
          case 'get_credit_cards':
            return await this.getCreditCards(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async getTodos(args) {
    let query = supabase.from('todos').select('*');

    if (args.user_id) {
      query = query.eq('user_id', args.user_id);
    }

    if (args.completed !== undefined) {
      query = query.eq('completed', args.completed);
    }

    if (args.priority) {
      query = query.eq('priority', args.priority);
    }

    // Use the same ordering as the common API
    query = query
      .order('pinned', { ascending: false })
      .order('sort_order', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              todos: data,
              count: data.length,
              summary: `Found ${data.length} todos${args.completed !== undefined ? ` (${args.completed ? 'completed' : 'pending'})` : ''}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async addTodo(args) {
    // Get the highest sort_order value (same logic as common API)
    const { data: maxOrderData } = await supabase
      .from('todos')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder =
      maxOrderData && maxOrderData.length > 0 && maxOrderData[0].sort_order
        ? maxOrderData[0].sort_order + 1
        : 1;

    const todoData = {
      user_id: args.user_id,
      task: args.task,
      priority: args.priority || 'medium',
      due_date: args.due_date || new Date().toISOString().split('T')[0],
      completed: false,
      sort_order: nextOrder,
      pinned: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('todos').insert([todoData]).select();

    if (error) throw error;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              todo: data[0],
              message: `Todo "${args.task}" added successfully`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async getCreditCards(args) {
    let query = supabase.from('credit_cards_simplified').select('*');

    if (args.user_id) {
      query = query.eq('user_id', args.user_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    let filteredData = data;

    // Filter by bank name
    if (args.bank_name) {
      filteredData = filteredData.filter(card => {
        const bankName = (card.bank_name || '').toLowerCase();
        return bankName.includes(args.bank_name.toLowerCase());
      });
    }

    // Filter for inactive cards (90+ days)
    if (args.inactive_only) {
      filteredData = filteredData.filter(card => {
        if (card.days_inactive && card.days_inactive > 90) return true;
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince > 90;
      });
    }

    // Filter for expiring promos
    if (args.promo_expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      filteredData = filteredData.filter(card => {
        if (!card.current_promos || !Array.isArray(card.current_promos)) return false;
        return card.current_promos.some(promo => {
          if (!promo.promo_expiry_date) return false;
          const expiryDate = new Date(promo.promo_expiry_date);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        });
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              credit_cards: filteredData,
              count: filteredData.length,
              summary: `Found ${filteredData.length} credit cards${args.bank_name ? ` from ${args.bank_name}` : ''}${args.inactive_only ? ' (inactive 90+ days)' : ''}${args.promo_expiring ? ' (promo expiring soon)' : ''}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FinTask MCP Server running on stdio');
  }
}

const server = new FinTaskMCPServer();
server.run().catch(console.error);
