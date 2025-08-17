# 🚀 FinTask Quick Reference Guide

## 🎯 Essential Information
- **Project**: FinTask - AI-first finance & productivity PWA
- **Version**: v3.4.3
- **Status**: Production-ready with complete AI features
- **URL**: https://fintask.netlify.app

## ⚡ Quick Start Commands
```bash
# Setup development environment
git clone https://github.com/username/vinod-finance-todo.git
cd vinod-finance-todo
npm install
cp .env.example .env  # Add your API keys
npm run mcp:setup     # Setup AI assistant
npm start             # Start development server

# Testing (Cypress E2E)
npm run test:e2e      # Run all E2E tests
npm run test:e2e:ai   # Test AI assistant specifically
npm run cypress:open  # Interactive test runner
npm run test:e2e:essential # Essential tests for CI/CD

# AI Features
npm run mcp:start     # Start MCP server for external AI
npm run mcp:dev       # MCP server with auto-reload
```

## 🤖 AI Architecture Overview
```
User → Dashboard → ProactiveDashboard → AI Insights
     → AI Assistant → GeminiClient → Natural Language Processing
     → MCP Server → Database Queries → Supabase
```

## 🔑 Key Files for AI Development
```
src/components/
├── AIAssistant.js           # Main AI chat interface
├── AIAssistantEnhanced.js   # Enhanced AI features  
├── VisualInsights.js        # AI-powered charts
└── ProactiveDashboard.js    # Proactive insights

src/services/
├── api.js                   # Single API layer (SSOT)
├── geminiClient.js          # Google Gemini integration
├── mcpClient.js             # MCP server communication
└── proactiveAlerts.js       # Alert generation

mcp-server/
├── index.js                 # MCP server implementation
├── services/                # Database service layers
└── .env                     # MCP server configuration
```

## 🎨 AI Query Examples
```javascript
// Natural language queries supported:
"show me pending todos"
"which cards haven't been used recently?"
"what needs my attention today?"
"give me financial insights"
"add a todo to pay rent next month"
"analyze my spending patterns"
```

## 🔧 Environment Variables (Required)
```env
# Core (Required)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_GEMINI_API_KEY=your_gemini_key

# MCP Server (Required for AI)
SUPABASE_SERVICE_KEY=your_service_key
MCP_SERVER_PORT=3001

# Web Push (Optional - notifications)
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# ❌ NO LONGER NEEDED:
# REACT_APP_FIREBASE_* - Firebase removed
# REACT_APP_PLAID_* - Plaid integration removed
```

## 🧪 Testing AI Features
```bash
# Test AI assistant UI
cy.get('[data-cy="ai-assistant-button"]').click();
cy.get('[data-cy="chat-input"]').type('show me pending todos{enter}');
cy.get('[data-cy="ai-response"]').should('contain', 'pending todos');

# Test proactive alerts
cy.get('[data-cy="proactive-alerts"]').should('be.visible');

# Test visual insights
cy.get('[data-cy="visual-insights-chart"]').should('be.visible');
```

## 🚨 Common Issues & Quick Fixes
```bash
# AI not responding
1. Check REACT_APP_GEMINI_API_KEY is set
2. Verify user is authenticated
3. Check browser console for errors

# MCP server issues
cd mcp-server && npm start
curl http://localhost:3001/health

# Database connection
Check Supabase URL and keys in .env
Verify RLS policies are enabled

# Build issues
rm -rf node_modules package-lock.json
npm install
npm run pre-release
```

## 📊 AI Features Status
✅ **Proactive AI Assistant** - Complete  
✅ **Smart Insights Engine** - Complete  
✅ **Visual Analytics** - Complete  
✅ **Natural Language Processing** - Complete  
✅ **MCP Server Integration** - Complete  
✅ **E2E Testing** - Complete

## ❌ **Removed Features**
❌ **Expense Tracking** - Removed in v3.0+
❌ **Plaid Integration** - Too complex, removed
❌ **Firebase Notifications** - Replaced with web-push
❌ **Manual Transaction Entry** - Focus on credit cards only
❌ **Teller Integration** - Never implemented  

## 🔮 Next Steps for AI Enhancement
1. **Voice Input/Output** - Speech integration
2. **Advanced NLP** - Better query understanding  
3. **Predictive Analytics** - Spending forecasts
4. **Bank API Integration** - Real transaction data
5. **Smart Categorization** - Auto-expense tagging

## 📚 Key Documentation
- [**Onboarding KT**](ONBOARDING_KT.md) - Complete guide
- [AI Features Summary](AI_FEATURES_SUMMARY.md) - Current capabilities
- [MCP Integration Guide](docs/MCP_INTEGRATION_GUIDE.md) - External AI setup
- [API Architecture](docs/API_ARCHITECTURE.md) - Single source of truth

---
*For complete details, see [ONBOARDING_KT.md](ONBOARDING_KT.md)*