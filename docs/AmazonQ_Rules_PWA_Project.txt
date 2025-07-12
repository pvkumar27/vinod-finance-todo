
📜 Amazon Q Development Rules for Personal Finance + To-Do PWA

1. Always follow the project strategy defined in docs/PWA_Project_Guidelines.md.
2. Use only React functional components — no class components.
3. Tailwind CSS must be used for all styling (no inline or external CSS).
4. Use Supabase for backend, including authentication and data storage.
5. Never store sensitive data (e.g., credit card numbers, CVVs, passwords). Only store metadata.
6. Follow the folder structure recommended in the strategy document.
7. Ensure all components are reusable and follow the single-responsibility principle.
8. Use camelCase for all variable and function names.
9. Do not suggest third-party libraries unless explicitly asked.
10. Prioritize mobile-first responsive design using Tailwind utility classes.
11. Push notification support should use Firebase Cloud Messaging only.
12. All natural language input should be handled in a scalable and pluggable way.
13. APIs should be protected by Supabase Auth and Row-Level Security (RLS).
14. Use async/await and modularize fetch or Supabase calls into a utilities folder.
15. Avoid any hosting or data flow that violates personal privacy or security expectations.

✅ These rules must be honored for all code generation, suggestions, architecture proposals, and refactoring steps.
