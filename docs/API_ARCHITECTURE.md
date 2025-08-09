# API Architecture - Single Source of Truth

## Overview
FinTask uses a centralized API layer to ensure consistent data access between the React application and AI assistant. This eliminates code duplication and prevents data discrepancies.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  AI Assistant   │
│   Components    │    │   (Finbot)      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │   Single API Layer   │
          │  (src/services/      │
          │      api.js)         │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │  Supabase Database   │
          └──────────────────────┘
```

## Implementation

### Single API Layer (`src/services/api.js`)

```javascript
export const api = {
  // Todos
  async getTodos(filters = {}) { /* ... */ },
  async addTodo(todoData) { /* ... */ },
  
  // Credit Cards  
  async getCreditCards(filters = {}) { /* ... */ },
  // ... other methods
};
```

### Usage in React Components

```javascript
import { api } from '../services/api.js';

// Get pending todos
const todos = await api.getTodos({ completed: false });

// Get inactive credit cards
const cards = await api.getCreditCards({ inactive_only: true });
```

### Usage in AI Assistant

```javascript
// Natural language: "show my pending todos"
const todos = await api.getTodos({ completed: false });

// Natural language: "show my amex card"  
const cards = await api.getCreditCards({ card_name: 'amex' });
```

## Supported Filters

### Todos
- `completed: boolean` - Filter by completion status
- `priority: string` - Filter by priority (low, medium, high)
- `due_date: string` - Filter by due date (YYYY-MM-DD format)

### Credit Cards
- `card_name: string` - Filter by card name (partial match)
- `inactive_only: boolean` - Show only cards inactive 90+ days
- `promo_expiring: boolean` - Show only cards with promos expiring within 30 days

## Natural Language Processing

The AI assistant automatically extracts filters from natural language:

| Query | Extracted Filters |
|-------|------------------|
| "show pending todos" | `{ completed: false }` |
| "show my amex card" | `{ card_name: 'amex' }` |
| "todos due tomorrow" | `{ completed: false, due_date: '2025-01-16' }` |
| "inactive cards" | `{ inactive_only: true }` |
| "promo expiring cards" | `{ promo_expiring: true }` |

## Benefits

### ✅ Consistency
- React app and AI assistant always return identical data
- Same filtering logic applied everywhere
- No possibility of data discrepancies

### ✅ Maintainability  
- Single place to update business logic
- Add new filters once, works in both systems
- Fix bugs once, fixes everywhere

### ✅ Authentication
- Automatic user context for all operations
- Row-level security enforced consistently
- No need to pass user IDs manually

### ✅ Performance
- No duplicate API calls
- Shared caching opportunities
- Reduced bundle size

## Migration from Dual Services

**Before (Problematic):**
```
React App → creditCards.js → Supabase
AI Assistant → mcpClient.js → MCP Server → creditCards.js → Supabase
```

**After (Clean):**
```
React App → api.js → Supabase
AI Assistant → api.js → Supabase  
```

This eliminates the MCP server complexity and ensures both systems use identical logic.