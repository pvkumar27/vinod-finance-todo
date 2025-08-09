# FinTask MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with access to FinTask's financial and todo data.

## Features

### 🤖 AI Assistant Tools
- **Todo Management**: Get, add, and analyze todos with natural language
- **Credit Card Insights**: Access card data, inactivity alerts, promo tracking
- **Financial Analysis**: Spending patterns, utilization insights, forecasting
- **Transaction Search**: Natural language transaction queries
- **Smart Recommendations**: AI-powered financial advice

### 🔧 Available Tools

#### Todo Tools
- `get_todos` - Retrieve todos with filtering (completed, priority, user)
- `add_todo` - Add new todos via natural language

#### Credit Card Tools  
- `get_credit_cards` - Get cards with filters (inactive, promo expiring)
- `analyze_spending` - Spending pattern analysis and forecasting
- `get_financial_insights` - AI-powered financial recommendations

#### Search Tools
- `search_transactions` - Natural language transaction search

## Setup

1. **Install Dependencies**
   ```bash
   cd mcp-server
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run Server**
   ```bash
   npm start
   ```

## Integration with AI Assistants

### Claude Desktop
Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "fintask": {
      "command": "node",
      "args": ["path/to/fintask-mcp-server/index.js"],
      "env": {
        "SUPABASE_URL": "your_url",
        "SUPABASE_SERVICE_KEY": "your_key"
      }
    }
  }
}
```

### Example Queries
Once connected, you can ask the AI assistant:

- _"Show me all my incomplete todos"_
- _"Which credit cards haven't been used in 90 days?"_
- _"Add a todo to pay rent next month"_
- _"What's my spending pattern this quarter?"_
- _"Find all transactions over $200 last month"_

## Security

- Uses Supabase Row Level Security (RLS)
- Service key required for database access
- User ID filtering for data isolation
- No sensitive data exposure (card numbers, etc.)

## Development

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## Architecture

```
AI Assistant
     ↓
MCP Protocol
     ↓
FinTask MCP Server
     ↓
Supabase Database
```

The server acts as a bridge between AI assistants and your FinTask data, enabling natural language queries and intelligent insights.