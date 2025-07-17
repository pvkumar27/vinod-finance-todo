
# FinTask – Strategy & Guidelines

## 🔖 Project Name
**FinTask**

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

## 8. 🔄 Version Control & Rollback System

### **Version-Based Rollback (Implemented)**
Professional rollback system allowing version-specific deployments:

**Features:**
- ✅ Git tags for all releases (v1.0.0, v1.1.0, v1.2.0, v1.3.0)
- ✅ Automated rollback script: `npm run rollback v1.2.0`
- ✅ Version display in UI footer
- ✅ Complete version history documentation
- ✅ Safe rollback (preserves git history)

**Usage:**
```bash
# Rollback to any version
npm run rollback v1.2.0

# Check available versions
git tag -l

# View version history
cat VERSION_HISTORY.md
```

**Files:**
- `scripts/rollback.js` - Automated rollback script
- `VERSION_HISTORY.md` - Version-commit mapping
- `src/constants/version.js` - Current version constant
- Git tags for all releases

---

## 9. 🎯 Future Goals & Objectives

### **Live Dashboard Integration (Next Phase)**
Replace the current non-functional home screen buttons with embedded, live dashboards:

- **Credit Cards Dashboard:** Active cards, expiring promos, balance trends
- **Expenses Dashboard:** Monthly trends, category breakdown, budget tracking
- **To-Dos Dashboard:** Pending tasks, completion trends, priority highlights

**Technical Requirements:**
- Real-time data from Supabase
- Interactive charts (Chart.js or Recharts)
- Mobile-responsive design

---

## 10. ✅ Dev Checklist

### **Core Development:**
- [x] Node & npm setup
- [x] Tailwind & PWA initialized
- [x] VS Code configured
- [x] Supabase project setup
- [x] MVP modules implemented (CRUD for all)
- [x] PWA tested and deployed

### **Advanced Features:**
- [x] Natural language input implemented
- [x] Working edit functionality for all modules
- [x] Custom PWA icon and branding
- [x] Version-based rollback system
- [x] Professional release documentation

### **Pending Features:**
- [ ] Firebase push notifications
- [ ] Live dashboards implementation
- [ ] Charts and analytics integration
- [ ] Data export functionality
- [ ] Income tracking module
