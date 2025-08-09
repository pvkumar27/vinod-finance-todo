# FinTask MCP Integration Guide

## Overview

FinTask implements a Model Context Protocol (MCP) server to enable AI assistants to interact with your financial and todo data through natural language queries. This guide covers the complete setup, architecture, and usage.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Assistant  │───▶│   MCP Client    │───▶│   MCP Server    │───▶│   Supabase DB   │
│   (React UI)    │    │  (mcpClient.js) │    │   (Node.js)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

1. **AI Assistant (React)**: Chat interface for user interaction
2. **MCP Client**: Handles natural language processing and tool calls
3. **MCP Server**: Implements MCP protocol and database operations
4. **Supabase Database**: Stores todos, credit cards, and user data

## 🚀 Quick Setup

### 1. Automated Setup (Recommended)
```bash
npm run mcp:setup
```

This will:
- Install MCP server dependencies
- Create environment configuration
- Set up required files

### 2. Manual Setup

```bash
# Install MCP server dependencies
cd mcp-server
npm install

# Create environment file
cp .env.example .env
```

Edit `mcp-server/.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
MCP_SERVER_PORT=3001
```

### 3. Start Services

```bash
# Terminal 1: Start MCP Server
npm run mcp:start

# Terminal 2: Start React App
npm start
```

## 🛠️ Available Tools

### Todo Management
- `get_todos` - Retrieve todos with filtering
- `add_todo` - Create new todos

### Credit Card Analysis
- `get_credit_cards` - Get cards with filters
- `analyze_spending` - Spending pattern analysis
- `get_financial_insights` - AI-powered recommendations

### Transaction Search
- `search_transactions` - Natural language transaction queries

## 💬 Natural Language Examples

### Todo Queries
```
"Show me all my pending todos"
"Add a todo to pay rent next month"
"What high priority tasks do I have?"
"Create a task to review credit card statements"
```

### Credit Card Queries
```
"Which credit cards haven't been used recently?"
"Show me cards with expiring promotional rates"
"What's my credit utilization across all cards?"
"Which card should I use for gas purchases?"
```

### Spending Analysis
```
"Analyze my spending this month"
"How much did I spend on groceries last quarter?"
"Show me transactions over $200"
"What are my spending trends?"
```

### Financial Insights
```
"Give me financial insights"
"What cards are at risk of inactivity?"
"When do my promotional rates expire?"
"How can I optimize my credit utilization?"
```

## 🔧 Development

### MCP Server Development
```bash
# Development with auto-reload
npm run mcp:dev

# Production mode
npm run mcp:start
```

### Adding New Tools

1. **Define Tool in MCP Server** (`mcp-server/index.js`):
```javascript
{
  name: 'new_tool',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  }
}
```

2. **Implement Tool Handler**:
```javascript
async newTool(args) {
  // Implementation logic
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}
```

3. **Add to MCP Client** (`src/services/mcpClient.js`):
```javascript
async newTool(args) {
  // Client-side implementation
  return result;
}
```

### Natural Language Processing

The MCP client includes basic NLP for query understanding:

```javascript
async processNaturalLanguageQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('todo')) {
    // Handle todo queries
  } else if (lowerQuery.includes('card')) {
    // Handle credit card queries
  }
  // ... more conditions
}
```

## 🧪 Testing

### E2E Tests
```bash
# Run AI Assistant tests
npm run test:e2e:ai

# Run all tests including AI
npm run test:e2e
```

### Test Coverage
- AI Assistant UI interactions
- Natural language query processing
- Tool call responses
- Error handling
- Mobile responsiveness

## 🔒 Security

### Authentication
- All MCP tools require authenticated user
- User ID automatically added to queries
- Supabase Row Level Security (RLS) enforced

### Data Privacy
- No sensitive data (card numbers, CVVs) exposed
- Service key required for database access
- User data isolation through RLS policies

### Environment Variables
```env
# Required for MCP Server
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_service_key

# Optional
MCP_SERVER_PORT=3001
REACT_APP_MCP_SERVER_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Won't Start**
   - Check environment variables in `mcp-server/.env`
   - Verify Supabase credentials
   - Ensure port 3001 is available

2. **AI Assistant Not Responding**
   - Verify MCP server is running
   - Check browser console for errors
   - Confirm user is authenticated

3. **Database Connection Issues**
   - Verify Supabase URL and service key
   - Check RLS policies are configured
   - Ensure tables exist (todos, credit_cards_manual)

### Debug Mode
```bash
# Start MCP server with debug logging
DEBUG=* npm run mcp:start
```

### Logs
- MCP Server logs: Console output
- React App logs: Browser developer tools
- Database logs: Supabase dashboard

## 📈 Performance

### Optimization Tips
- MCP server caches frequently accessed data
- Natural language processing is client-side
- Database queries use proper indexing
- Responses are paginated for large datasets

### Monitoring
- Track query response times
- Monitor database connection pool
- Log natural language query patterns
- Measure user engagement with AI features

## 🔄 Future Enhancements

### Planned Features
- Voice input/output support
- Advanced NLP with ML models
- Integration with external financial APIs
- Predictive analytics and forecasting
- Multi-language support

### Integration Opportunities
- Claude Desktop MCP integration
- OpenAI Assistant API
- Custom AI model training
- Financial data aggregation services

## 📚 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Natural Language Processing Libraries](https://github.com/NaturalNode/natural)

## 🤝 Contributing

When contributing to MCP functionality:

1. Follow existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Consider security implications
5. Test with real user scenarios

### Code Style
- Use async/await for asynchronous operations
- Implement proper error handling
- Add JSDoc comments for complex functions
- Follow React best practices for UI components