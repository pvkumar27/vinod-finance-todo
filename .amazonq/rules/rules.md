
📜 Amazon Q Development Rules for FinTask

## 📚 Required Reading
- [Knowledge Transfer Document](ONBOARDING_KT.md) - Complete project overview and setup
- [Quick Reference Guide](QUICK_REFERENCE.md) - Essential commands and patterns
- [Project Guidelines](docs/PWA_Project_Guidelines.md) - Strategy and architecture

## 🏗️ Architecture Rules
1. Always follow the project strategy defined in docs/PWA_Project_Guidelines.md.
2. Use only React functional components — no class components.
3. Tailwind CSS must be used for all styling (no inline or external CSS).
4. Use Supabase for backend, including authentication and data storage.
5. Never store sensitive data (e.g., credit card numbers, CVVs, passwords). Only store metadata.
6. Follow the folder structure recommended in the strategy document.
7. Ensure all components are reusable and follow the single-responsibility principle.
8. Use camelCase for all variable and function names.

## 🚫 Decommissioned Features (DO NOT IMPLEMENT)
9. ❌ Firebase integration - Replaced with Web Push API
10. ❌ Plaid integration - Removed due to complexity
11. ❌ Expense tracking - Focus on AI-first approach only
12. ❌ Manual transaction entry - Credit cards only
13. ❌ Teller integration - Never implemented

## 🤖 AI-First Development
14. All natural language input should be handled via Google Gemini AI.
15. Use MCP server for external AI assistant integration.
16. Prioritize AI-driven insights over manual data entry.
17. APIs should be protected by Supabase Auth and Row-Level Security (RLS).
18. Use async/await and modularize fetch or Supabase calls into src/services/api.js.

## 🔒 Security & Privacy
19. Avoid any hosting or data flow that violates personal privacy or security expectations.
20. Use Web Push API with VAPID keys for notifications (not Firebase).
21. Only use credit_cards_manual table (old tables removed).

## 📱 UI/UX Standards
22. Prioritize mobile-first responsive design using Tailwind utility classes.
23. Do not suggest third-party libraries unless explicitly asked.
24. Follow AI-first design patterns from existing components.

✅ These rules must be honored for all code generation, suggestions, architecture proposals, and refactoring steps.
