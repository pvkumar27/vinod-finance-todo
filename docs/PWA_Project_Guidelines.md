
# Personal Finance + To-Do PWA – Strategy & Guidelines

## 🔖 Project Name
**Personal Finance + To-Do PWA**

---

## 1. 🎯 Purpose

To build a **mobile-first Progressive Web App (PWA)** to:
- Track 30+ personal and 15+ spouse’s credit cards
- Manage promo APR expiration, inactivity, and metadata
- Track expenses and income monthly
- Maintain household to-dos
- Accept natural language inputs
- Run securely with no sensitive data storage (only metadata)

---

## 2. 📚 Knowledge Transfer (KT) Summary

| Topic         | Description                                             |
|---------------|---------------------------------------------------------|
| Owner         | Vinod Kumar Pasupunuri                                  |
| Tech Stack    | React (CRA), Tailwind CSS, Supabase, Firebase, VS Code |
| Backend       | Supabase with RLS (Row-Level Security)                 |
| Hosting       | GitHub Pages / Netlify / Firebase Hosting              |
| Deployment    | Manual first, CI/CD optional later                     |
| Target Device | Mobile-first, PWA-enabled                               |
| AI Assistants | ChatGPT-4 (paid) + Amazon Q (Enterprise)               |

---

## 3. 📐 Architecture & Modules

| Module              | Description                                           |
|---------------------|-------------------------------------------------------|
| Credit Card Tracker | Tracks name, bank, type, APR promo, expiration, etc. |
| Expense Manager     | Tracks categorized expenses, income, monthly totals   |
| To-Do Module        | Chores/tasks with reminders                          |
| Natural Input       | Commands like “Remind me to pay Discover on July 5” |
| Notifications       | Push alerts (Firebase)                               |
| Auth                | Supabase Auth (email/password)                       |

---

## 4. 🔧 Strategy & Milestones

| Week   | Task                                       |
|--------|--------------------------------------------|
| Week 1 | Setup PWA, Tailwind, Folder Structure       |
| Week 2 | Credit Card Tracker MVP                    |
| Week 3 | Expense + Income Tracker                   |
| Week 4 | To-Do & AI input                            |
| Week 5 | Firebase Push Notifications                |
| Week 6 | UI Polish, Export, Backups                 |

---

## 5. 📏 Coding Standards

- Use `camelCase` for variables and functions
- Prefer functional React components (`useState`, `useEffect`)
- Folder structure:
  ```
  /src
    /components
    /pages
    /hooks
    /utils
    /data
    App.jsx
    index.js
  ```
- Use Tailwind consistently; extract repeated UI into components
- Secure secrets in `.env` file

---

## 6. 🔐 Security Guidelines

- No storage of PII, CVVs, or card numbers
- Store metadata only
- Use Supabase with RLS enabled
- Protect all API endpoints via Supabase Auth

---

## 7. 🧠 ChatGPT vs Amazon Q Roles

| Tool       | Role                                                  |
|------------|-------------------------------------------------------|
| ChatGPT    | Planning, architecture, guidance, natural language    |
| Amazon Q   | Code generation, debugging, VS Code assistance        |

---

## 8. 🎯 New Goals & Objectives

### **Live Dashboard Integration (Phase 2)**
Replace the current non-functional home screen buttons ("Manage Cards", "View Expenses", "Manage Tasks") with embedded, live dashboards powered by Supabase data — featuring:

- **Credit Cards Dashboard:**
  - Active cards count
  - Cards with expiring promos
  - Total balance across cards
  - Recent activity chart

- **Expenses Dashboard:**
  - Monthly spending trends
  - Category breakdown (pie/bar charts)
  - Budget vs actual spending
  - Top expense categories

- **To-Dos Dashboard:**
  - Pending vs completed tasks
  - Overdue tasks alerts
  - Task completion trends
  - Priority task highlights

**Technical Requirements:**
- Real-time data from Supabase
- Interactive charts (Chart.js or Recharts)
- Mobile-responsive design
- Auto-refresh capabilities

---

## 9. ✅ Dev Checklist

- [x] Node & npm setup
- [x] Tailwind & PWA initialized
- [x] VS Code configured
- [x] Supabase project setup
- [x] Natural language input implemented
- [x] MVP modules implemented
- [x] PWA tested and deployed
- [ ] Firebase push configured
- [ ] Live dashboards implementation
- [ ] Charts and analytics integration
