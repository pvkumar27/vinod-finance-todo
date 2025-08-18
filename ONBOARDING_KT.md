# 📚 FinTask Knowledge Transfer (KT) Document

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [AI-First Architecture](#ai-first-architecture)
3. [Technical Stack](#technical-stack)
4. [Development Environment Setup](#development-environment-setup)
5. [AI Features & Capabilities](#ai-features--capabilities)
6. [Code Structure & Patterns](#code-structure--patterns)
7. [Database Schema](#database-schema)
8. [API Architecture](#api-architecture)
9. [Testing Framework](#testing-framework)
10. [Deployment & CI/CD](#deployment--cicd)
11. [Security Guidelines](#security-guidelines)
12. [Troubleshooting Guide](#troubleshooting-guide)
13. [Future Roadmap](#future-roadmap)

---

## 🎯 Project Overview

### What is FinTask?
**FinTask** is an AI-first Progressive Web App (PWA) designed as a personal finance and productivity assistant, inspired by Cleo's conversational approach. It helps users manage:

- **Credit Cards** (personal + spouse) with metadata tracking
- **To-Dos** with smart prioritization and AI assistance
- **Proactive Alerts** for card inactivity, promo expirations
- **AI-Powered Insights** through natural language interaction

### ❌ **Decommissioned Features** (No Longer Available)
- **Expenses Tab** - Removed in favor of AI-first approach
- **Firebase Integration** - Replaced with web-push notifications
- **Plaid Integration** - Removed due to complexity
- **Teller Integration** - Never implemented
- **Old Credit Card Tables** - Migrated to simplified schema
- **Manual Expense Tracking** - Focus shifted to credit card management

### Current Status
- **Version**: v3.4.3
- **Status**: Production-ready with AI-first features complete
- **Deployment**: Netlify (https://fintask.netlify.app)
- **Branch Strategy**: `main` (production), `feature/*` (development)

### Key Differentiators
✅ **AI-First Design** - Intelligence drives the user experience  
✅ **Proactive Insights** - AI surfaces issues before users ask  
✅ **Visual Analytics** - Charts and graphs tell financial stories  
✅ **Mobile-First PWA** - Works offline, installable  
✅ **Security-Focused** - No sensitive data storage (metadata only)

---

## 🏗️ AI-First Architecture

### Core Philosophy
The app follows an **AI-first approach** where artificial intelligence is the primary interface for user interaction, similar to Cleo's conversational finance assistant.

### AI Components Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
├─────────────────────────────────────────────────────────────┤
│  Dashboard → ProactiveDashboard → AI Insights              │
│  AI Assistant → Enhanced Chat → Visual Responses           │
├─────────────────────────────────────────────────────────────┤
│                 AI Processing Layer                         │
│  GeminiClient → Natural Language → Smart Insights          │
│  MCP Server → Tool Execution → Database Queries            │
├─────────────────────────────────────────────────────────────┤
│                   Data Layer                               │
│  Supabase → RLS Security → PostgreSQL                      │
└─────────────────────────────────────────────────────────────┘
```

### AI Integration Points
1. **Dashboard**: Proactive insights and visual analytics
2. **Chat Assistant**: Natural language query processing
3. **Alert System**: Automatic detection of issues requiring attention
4. **Visual Insights**: AI-generated charts and recommendations

---

## 🛠️ Technical Stack

### Frontend
- **React 18.3.1** - Functional components with hooks
- **Tailwind CSS 3.4.17** - Utility-first styling
- **PWA** - Service worker, offline support, installable
- **Recharts 3.1.2** - Data visualization for AI insights

### Backend & AI
- **Supabase** - Database, authentication, real-time subscriptions
- **Google Gemini AI** - Natural language processing
- **MCP Server** - Model Context Protocol for AI tool execution
- **Web Push API** - Push notifications (no Firebase dependency)

### ❌ **Removed Dependencies**
- **Firebase** - No longer used (replaced with web-push)
- **Plaid SDK** - Removed due to complexity
- **Teller SDK** - Never implemented
- **Chart.js** - Replaced with Recharts for AI visualizations

### Development Tools
- **Cypress 14.5.4** - E2E testing with AI assistant tests
- **Husky + Lint-staged** - Git hooks for code quality
- **ESLint + Prettier** - Code formatting and linting
- **GitHub Actions** - CI/CD pipeline

### Deployment
- **Netlify** - Primary hosting with serverless functions
- **GitHub** - Version control with automated workflows
- **Supabase** - Database hosting with global CDN

---

## 🚀 Development Environment Setup

### Prerequisites
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.30.0
```

### Quick Setup
```bash
# 1. Clone repository
git clone https://github.com/username/vinod-finance-todo.git
cd vinod-finance-todo

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 4. Setup MCP server for AI features
npm run mcp:setup

# 5. Start development
npm start  # Starts both React app and Netlify dev server
```

### Environment Variables Required
```env
# Supabase (Required)
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (Required for AI features)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Web Push Notifications (Optional)
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@example.com

# MCP Server (Required for AI assistant)
SUPABASE_SERVICE_KEY=your_service_role_key
MCP_SERVER_PORT=3001
```

### ❌ **Removed Environment Variables**
```env
# These are NO LONGER NEEDED:
# REACT_APP_FIREBASE_API_KEY - Firebase removed
# REACT_APP_FIREBASE_PROJECT_ID - Firebase removed
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID - Firebase removed
# REACT_APP_FIREBASE_APP_ID - Firebase removed
# REACT_APP_PLAID_CLIENT_ID - Plaid integration removed
# REACT_APP_PLAID_SECRET - Plaid integration removed
# REACT_APP_TELLER_API_KEY - Never implemented
```

### Database Setup
```sql
-- Run these SQL scripts in Supabase in order:
1. supabase-rls-setup.sql          -- Row Level Security
2. supabase-add-completed-column.sql -- Todo completion tracking
3. database/migrations/003_create_credit_cards_table.sql -- Credit cards

-- IMPORTANT: Clean up old tables if migrating
4. drop-expenses-tables.sql         -- Remove old expenses/plaid tables
```

### ❌ **Removed Database Tables**
```sql
-- These tables were REMOVED and should be dropped:
DROP TABLE IF EXISTS expenses CASCADE;        -- Old expense tracking
DROP TABLE IF EXISTS my_finances CASCADE;     -- Old finance table
DROP TABLE IF EXISTS credit_cards CASCADE;    -- Old credit cards table
DROP TABLE IF EXISTS plaid_tokens CASCADE;    -- Plaid integration
DROP TABLE IF EXISTS plaid_accounts CASCADE;  -- Plaid accounts
```

---

## 🤖 AI Features & Capabilities

### Current AI Implementation

#### 1. Proactive AI Assistant
**Location**: `src/components/AIAssistant.js`
```javascript
// Key features:
- Proactive alert generation on expansion
- Visual insights integration
- Enhanced conversational interface
- Priority-based quick actions
```

### ❌ **Removed/Decommissioned Components**
- **ExpenseManager** - No longer exists
- **ExpenseTracker** - Removed in v3.0+
- **PlaidLink** - Plaid integration removed
- **FirebaseNotifications** - Replaced with web-push
- **FinancesTab** - Consolidated into AI insights
- **Old CreditCards table** - Migrated to `credit_cards_manual`

#### 2. Smart Insights Engine
**Location**: `src/components/VisualInsights.js`
```javascript
// Capabilities:
- Dynamic chart generation
- AI-powered data analysis
- Task completion visualization
- Credit card activity charts
```

#### 3. Proactive Dashboard
**Location**: `src/components/ProactiveDashboard.js`
```javascript
// Features:
- Real-time alert detection
- Interactive insight cards
- Priority-based organization
- Visual urgency indicators
```

### AI Query Types Supported

#### Natural Language Queries
```javascript
// Todo Management
"show me pending todos"
"add a todo to pay rent next month"
"what high priority tasks do I have?"

// Credit Card Analysis
"which cards haven't been used recently?"
"show me cards with expiring promotional rates"
"what's my credit utilization?"

// Financial Insights
"what needs my attention today?"
"give me financial insights"
"get optimization suggestions"
```

#### AI-Generated Responses
- **Priority Insights**: Urgent items requiring attention
- **Financial Analysis**: Comprehensive financial health overview
- **Visual Charts**: Dynamic data visualization with AI commentary
- **Optimization Suggestions**: AI-powered improvement recommendations

### MCP Server Integration
**Location**: `mcp-server/`

The Model Context Protocol server enables external AI assistants (like Claude Desktop) to interact with FinTask data:

```javascript
// Available MCP Tools:
- get_todos(filters)           // Retrieve todos with filtering
- add_todo(todoData)          // Add new todos
- get_credit_cards(filters)   // Get credit cards with filters
- analyze_spending()          // Spending pattern analysis
- get_financial_insights()    // AI-powered recommendations
- search_transactions(query)  // Natural language search
```

---

## 📁 Code Structure & Patterns

### Project Structure
```
src/
├── components/           # React components
│   ├── AIAssistant.js           # Main AI chat interface
│   ├── AIAssistantEnhanced.js   # Enhanced AI features
│   ├── VisualInsights.js        # AI-powered charts
│   ├── ProactiveDashboard.js    # Proactive insights
│   ├── CreditCardManager.js     # Credit card management
│   ├── ToDoTest.js              # Todo management
│   ├── InsightsTab.js           # AI insights tab
│   ├── chat/                    # Chat-related components
│   └── shared/                  # Reusable UI components
├── services/            # API and business logic
│   ├── api.js                   # Single API layer (SSOT)
│   ├── geminiClient.js          # Google Gemini integration
│   ├── mcpClient.js             # MCP server communication
│   └── proactiveAlerts.js       # Alert generation logic
├── utils/               # Utility functions
│   ├── aiAssistantUtils.js      # AI helper functions
│   ├── smartInsights.js         # Insight generation
│   └── smartPatterns.js         # Pattern recognition
├── hooks/               # Custom React hooks
├── pages/               # Page components
└── constants/           # App constants and configuration
```

### ❌ **Removed Components/Files**
```
# These components NO LONGER EXIST:
src/components/
├── ExpenseManager.js     # ❌ REMOVED - Expense tracking
├── ExpenseTracker.js     # ❌ REMOVED - Manual expense entry
├── PlaidLink.js          # ❌ REMOVED - Plaid integration
├── FinancesTab.js        # ❌ REMOVED - Consolidated into AI
├── BankConnection.js     # ❌ REMOVED - Bank API integration
└── TransactionList.js    # ❌ REMOVED - Transaction display

src/services/
├── plaidService.js       # ❌ REMOVED - Plaid API calls
├── tellerService.js      # ❌ REMOVED - Never implemented
├── firebaseService.js    # ❌ REMOVED - Firebase integration
└── expenseService.js     # ❌ REMOVED - Expense API calls
```

### Key Design Patterns

#### 1. Single API Layer Pattern
**File**: `src/services/api.js`
```javascript
// Centralized API ensures consistency between React app and AI
export const api = {
  async getTodos(filters = {}) { /* ... */ },
  async getCreditCards(filters = {}) { /* ... */ },
  // All data access goes through this layer
};
```

#### 2. AI-First Component Pattern
```javascript
// Components designed with AI integration in mind
const Component = () => {
  const [aiInsights, setAiInsights] = useState([]);
  
  useEffect(() => {
    // Proactive AI analysis on component mount
    generateProactiveInsights();
  }, []);
  
  return (
    <div>
      {/* AI insights prominently displayed */}
      <AIInsightsSection insights={aiInsights} />
      {/* Traditional UI follows */}
      <TraditionalContent />
    </div>
  );
};
```

#### 3. Proactive Alert Pattern
```javascript
// Automatic detection and surfacing of issues
const generateProactiveAlerts = async () => {
  const alerts = [];
  
  // Credit card inactivity (90+ days)
  const inactiveCards = await api.getCreditCards({ inactive_only: true });
  if (inactiveCards.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Inactive Credit Cards',
      count: inactiveCards.length,
      action: 'Review inactive cards'
    });
  }
  
  return alerts;
};
```

### Coding Standards

#### React Patterns
```javascript
// ✅ Functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>Content</div>;
};

// ❌ Avoid class components
class MyComponent extends React.Component { /* ... */ }
```

#### Tailwind CSS Usage
```javascript
// ✅ Utility-first approach
<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow-lg">
  <h2 className="text-white font-bold text-xl mb-2">AI Insights</h2>
</div>

// ❌ Avoid inline styles
<div style={{background: 'linear-gradient(...)', padding: '16px'}}>
```

#### AI Integration Pattern
```javascript
// ✅ AI-first approach
const handleUserQuery = async (query) => {
  // 1. Process with AI first
  const aiResponse = await geminiClient.processQuery(query);
  
  // 2. Execute any required actions
  if (aiResponse.actions) {
    await executeActions(aiResponse.actions);
  }
  
  // 3. Return enhanced response
  return {
    ...aiResponse,
    visualInsights: await generateVisualInsights(aiResponse.data)
  };
};
```

---

## 🗄️ Database Schema

### Supabase Tables

#### 1. `todos` Table
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `credit_cards_manual` Table
```sql
CREATE TABLE credit_cards_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  card_name TEXT NOT NULL,
  bank TEXT,
  card_type TEXT, -- 'personal', 'business'
  promo_apr DECIMAL(5,2),
  promo_expiration DATE,
  last_used DATE,
  auto_pay BOOLEAN DEFAULT FALSE,
  card_holder TEXT, -- 'primary', 'spouse'
  last4 TEXT, -- Last 4 digits for identification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ❌ **Removed Database Tables**
```sql
-- These tables NO LONGER EXIST:

-- expenses table (removed in v3.0+)
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID,
  amount DECIMAL,
  category TEXT,
  description TEXT,
  date DATE
); -- ❌ REMOVED

-- plaid_tokens table (Plaid integration removed)
CREATE TABLE plaid_tokens (
  id UUID PRIMARY KEY,
  user_id UUID,
  access_token TEXT,
  item_id TEXT
); -- ❌ REMOVED

-- Old credit_cards table (replaced with credit_cards_manual)
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY,
  plaid_account_id TEXT,
  full_card_number TEXT  -- Security risk
); -- ❌ REMOVED
```

#### 3. Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards_manual ENABLE ROW LEVEL SECURITY;

-- Policies ensure users only see their own data
CREATE POLICY "Users can only see their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own credit cards" ON credit_cards_manual
  FOR ALL USING (auth.uid() = user_id);
```

### Data Access Patterns

#### AI-Friendly Queries
```javascript
// Get data for AI analysis
const getAIAnalysisData = async (userId) => {
  const [todos, creditCards] = await Promise.all([
    api.getTodos({ user_id: userId }),
    api.getCreditCards({ user_id: userId })
  ]);
  
  return {
    todos: {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      overdue: todos.filter(t => t.due_date && new Date(t.due_date) < new Date()).length,
      high_priority: todos.filter(t => t.priority === 'high').length
    },
    creditCards: {
      total: creditCards.length,
      inactive: creditCards.filter(c => isInactive(c.last_used)).length,
      promo_expiring: creditCards.filter(c => isPromoExpiring(c.promo_expiration)).length
    }
  };
};
```

---

## 🔌 API Architecture

### Single Source of Truth Pattern
**File**: `src/services/api.js`

The API layer serves as the single source of truth for all data operations, ensuring consistency between the React app and AI assistant.

```javascript
export const api = {
  // Todo operations
  async getTodos(filters = {}) {
    let query = supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.due_date) {
      query = query.eq('due_date', filters.due_date);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Credit card operations
  async getCreditCards(filters = {}) {
    let query = supabase
      .from('credit_cards_manual')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply AI-friendly filters
    if (filters.inactive_only) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      query = query.lt('last_used', ninetyDaysAgo.toISOString().split('T')[0]);
    }
    
    if (filters.promo_expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lt('promo_expiration', thirtyDaysFromNow.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
```

### AI Integration Layer
**File**: `src/services/geminiClient.js`

```javascript
class GeminiClient {
  async processQuery(query, context = {}) {
    const prompt = this.buildPrompt(query, context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseAIResponse(response, query);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(query);
    }
  }
  
  buildPrompt(query, context) {
    return `
      You are Finbot, an AI finance assistant for FinTask.
      
      User Query: ${query}
      
      Available Data:
      - Todos: ${JSON.stringify(context.todos || [])}
      - Credit Cards: ${JSON.stringify(context.creditCards || [])}
      
      Provide helpful, actionable insights in a conversational tone.
      Focus on financial health and productivity optimization.
    `;
  }
}
```

---

## 🧪 Testing Framework

### E2E Testing with Cypress
**Location**: `cypress/e2e/`

#### AI Assistant Tests
**File**: `cypress/e2e/ai-assistant.cy.js`
```javascript
describe('AI Assistant', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should display proactive alerts', () => {
    cy.get('[data-cy="ai-assistant-button"]').click();
    cy.get('[data-cy="proactive-alerts"]').should('be.visible');
  });

  it('should process natural language queries', () => {
    cy.get('[data-cy="ai-assistant-button"]').click();
    cy.get('[data-cy="chat-input"]').type('show me pending todos{enter}');
    cy.get('[data-cy="ai-response"]').should('contain', 'pending todos');
  });

  it('should generate visual insights', () => {
    cy.get('[data-cy="ai-assistant-button"]').click();
    cy.get('[data-cy="quick-action-insights"]').click();
    cy.get('[data-cy="visual-insights-chart"]').should('be.visible');
  });
});
```

#### Test Data Management
**File**: `cypress/support/commands.js`
```javascript
// Safe test data creation
Cypress.Commands.add('generateTestData', (type) => {
  const timestamp = Date.now();
  const testId = `Test_E2E_${timestamp}`;
  
  if (type === 'todo') {
    return {
      task: `${testId}_Task`,
      priority: 'medium',
      completed: false
    };
  }
  
  if (type === 'creditCard') {
    return {
      card_name: `${testId}_Card`,
      bank: 'Test Bank',
      card_type: 'personal'
    };
  }
});

// Cleanup test data
Cypress.Commands.add('cleanupTestData', () => {
  // Remove all test entries with Test_E2E_ prefix
  cy.task('cleanupDatabase');
});
```

### Test Scripts
```bash
# Run all E2E tests
npm run test:e2e

# Run AI-specific tests
npm run test:e2e:ai

# Run essential tests (for CI/CD)
npm run test:e2e:essential

# Interactive test runner
npm run cypress:open

# Run tests with browser visible
npm run test:e2e:headed

# Run tests in Chrome
npm run test:e2e:chrome
```

### Cypress Test Files
```
cypress/e2e/
├── essential.cy.js           # Core functionality tests
├── authentication.cy.js      # Login/logout tests
├── navigation.cy.js          # Tab navigation tests
├── ai-assistant.cy.js        # AI chat interface tests
└── ai-assistant-enhanced.cy.js # Advanced AI features tests
```

### ❌ **Removed Testing Framework**
- **Playwright** - Moved to Cypress for better PWA support
- **Jest E2E** - Replaced with Cypress for comprehensive testing
- **Puppeteer** - Never used, Cypress preferred

---

## 🚀 Deployment & CI/CD

### GitHub Actions Workflows
**Location**: `.github/workflows/`

#### 1. CI/CD Pipeline
**File**: `ci-cd.yml`
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, feature/*, hotfix/*]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e:essential
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Netlify
        run: echo "Auto-deploy via Netlify"
```

#### 2. E2E Tests Workflow
**File**: `e2e-tests.yml`
```yaml
name: E2E Tests
on:
  push:
    branches: [main, feature/*, hotfix/*]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cypress-io/github-action@v6
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
          spec: cypress/e2e/essential.cy.js
```

### Deployment Configuration

#### Netlify Settings
**File**: `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

#### Environment Variables (Production)
```bash
# Netlify Environment Variables
REACT_APP_SUPABASE_URL=production_url
REACT_APP_SUPABASE_ANON_KEY=production_anon_key
REACT_APP_GEMINI_API_KEY=production_gemini_key
```

### Release Process
```bash
# 1. Pre-release checks
npm run pre-release

# 2. Create release
npm run release v3.5.0

# 3. Automatic deployment via Netlify
# (Triggered by push to main branch)
```

---

## 🔒 Security Guidelines

### Data Security Principles

#### 1. No Sensitive Data Storage
```javascript
// ✅ Store metadata only
const creditCard = {
  card_name: 'Chase Sapphire',
  bank: 'Chase',
  last4: '1234',        // Last 4 digits only
  promo_apr: 0.00,
  promo_expiration: '2024-12-31'
};

// ❌ Never store sensitive data
const creditCard = {
  card_number: '1234-5678-9012-3456',  // NEVER
  cvv: '123',                          // NEVER
  full_account_number: '...'           // NEVER
};
```

#### 2. Row Level Security (RLS)
```sql
-- All tables have RLS enabled
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "user_isolation" ON todos
  FOR ALL USING (auth.uid() = user_id);
```

#### 3. API Security
```javascript
// All API calls include user authentication
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', user.id);  // Automatic user filtering
```

### Environment Security
```bash
# ✅ Use environment variables for secrets
REACT_APP_SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_service_key

# ❌ Never commit secrets to code
const apiKey = 'sk-1234567890abcdef';  // NEVER
```

### AI Security Considerations
```javascript
// ✅ Sanitize AI inputs
const sanitizeQuery = (query) => {
  return query
    .replace(/[<>]/g, '')  // Remove HTML tags
    .substring(0, 500);    // Limit length
};

// ✅ Validate AI responses
const validateAIResponse = (response) => {
  // Ensure response doesn't contain sensitive data
  const sensitivePatterns = [/\d{4}-\d{4}-\d{4}-\d{4}/, /\d{3}-\d{2}-\d{4}/];
  return !sensitivePatterns.some(pattern => pattern.test(response));
};
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. AI Assistant Not Responding
**Symptoms**: Chat interface loads but doesn't respond to queries
```javascript
// Check these items:
1. Verify REACT_APP_GEMINI_API_KEY is set
2. Check browser console for API errors
3. Ensure user is authenticated
4. Verify Supabase connection

// Debug steps:
console.log('Gemini API Key:', process.env.REACT_APP_GEMINI_API_KEY ? 'Set' : 'Missing');
console.log('User authenticated:', !!user);
```

#### 2. MCP Server Connection Issues
**Symptoms**: External AI assistants can't connect to FinTask data
```bash
# Check MCP server status
cd mcp-server
npm start

# Verify environment variables
cat .env

# Test connection
curl http://localhost:3001/health
```

#### 3. Database Connection Problems
**Symptoms**: Data not loading, authentication errors
```javascript
// Check Supabase configuration
import { supabase } from './supabaseClient';

const testConnection = async () => {
  const { data, error } = await supabase.auth.getUser();
  console.log('Auth status:', data ? 'Connected' : 'Failed');
  console.log('Error:', error);
};
```

#### 4. Build/Deployment Issues
**Symptoms**: Build fails, deployment errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm run check-updates

# Run pre-release checks
npm run pre-release
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Run tests with debug output
npm run test:e2e -- --config video=true,screenshotOnRunFailure=true
```

### Performance Monitoring
```javascript
// Monitor AI response times
const startTime = performance.now();
const response = await geminiClient.processQuery(query);
const endTime = performance.now();
console.log(`AI response time: ${endTime - startTime}ms`);

// Monitor database query performance
const { data, error, count } = await supabase
  .from('todos')
  .select('*', { count: 'exact' });
console.log(`Query returned ${count} records`);
```

---

## 🔮 Future Roadmap

### Phase 1: Enhanced AI Capabilities (Q2 2024)
- **Voice Input/Output**: Speech-to-text and text-to-speech
- **Advanced NLP**: Better understanding of complex financial queries
- **Predictive Analytics**: Forecast spending patterns and financial trends
- **Smart Categorization**: Auto-categorize expenses and transactions

### Phase 2: External Integrations (Q3 2024)
- **Alternative Bank APIs**: Explore Yodlee or other providers (NOT Plaid)
- **Credit Score Monitoring**: Integration with credit monitoring services
- **Investment Tracking**: Portfolio analysis and recommendations
- **Bill Reminder System**: Automatic bill detection and reminders

### ❌ **Discontinued Roadmap Items**
- **Plaid Integration**: Removed due to complexity and cost
- **Firebase Features**: Replaced with simpler web-push
- **Manual Expense Tracking**: Focus shifted to AI-first approach
- **Teller Integration**: Never pursued due to limited API access
- **Complex Transaction Categorization**: Simplified to credit card focus

### Phase 3: Advanced Features (Q4 2024)
- **Multi-User Support**: Family financial management
- **Goal Tracking**: AI-powered financial goal setting and monitoring
- **Expense Forecasting**: Predict future expenses based on patterns
- **Smart Budgeting**: AI-generated budget recommendations

### Phase 4: Enterprise Features (2025)
- **Business Expense Tracking**: Corporate credit card management
- **Team Collaboration**: Shared financial dashboards
- **Advanced Analytics**: Machine learning-powered insights
- **API Platform**: Allow third-party integrations

### Technical Debt & Improvements
- **Performance Optimization**: Lazy loading, code splitting
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Multi-language support
- **Advanced Testing**: Visual regression testing, performance testing

---

## 📚 Additional Resources

### Documentation Links
- [PWA Project Guidelines](docs/PWA_Project_Guidelines.md)
- [API Architecture](docs/API_ARCHITECTURE.md)
- [MCP Integration Guide](docs/MCP_INTEGRATION_GUIDE.md)
- [CI/CD Process](docs/CI_CD_PROCESS.md)
- [Developer Setup](DEVELOPER_SETUP.md)

### External Resources
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini AI](https://ai.google.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cypress Testing](https://docs.cypress.io/)

### Community & Support
- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Technical discussions and Q&A
- **Wiki**: Additional documentation and guides

---

## ✅ Onboarding Checklist

### For New Team Members
- [ ] Read this KT document completely
- [ ] Set up development environment
- [ ] Run the application locally
- [ ] Test AI assistant functionality
- [ ] Review code structure and patterns
- [ ] Understand security guidelines
- [ ] Run E2E tests successfully
- [ ] Deploy to staging environment
- [ ] Review current issues and roadmap

### Key Files to Review
- [ ] `src/components/AIAssistant.js` - Main AI interface
- [ ] `src/services/api.js` - Single API layer
- [ ] `src/services/geminiClient.js` - AI processing
- [ ] `mcp-server/index.js` - MCP server implementation
- [ ] `cypress/e2e/ai-assistant.cy.js` - AI tests
- [ ] `.github/workflows/` - CI/CD configuration

### Understanding Verification
- [ ] Can explain the AI-first architecture
- [ ] Understands the security model
- [ ] Can add new AI features
- [ ] Knows how to debug common issues
- [ ] Familiar with testing procedures
- [ ] Understands deployment process

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: March 2025

*This document serves as the comprehensive knowledge transfer guide for team members working on the FinTask project. It should be updated as the project evolves and new features are added.*