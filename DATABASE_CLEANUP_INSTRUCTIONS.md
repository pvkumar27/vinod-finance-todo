# Database Cleanup Instructions for v3.0.0

## 🗄️ Required Database Cleanup

Before deploying v3.0.0 to production, you must clean up the old database tables.

### **Step 1: Backup Important Data (Optional)**
If you have any important data in the old tables, back it up first:
```sql
-- Export data if needed
SELECT * FROM credit_cards;
SELECT * FROM expenses;
SELECT * FROM my_finances;
```

### **Step 2: Run Cleanup Script**
Execute the following SQL in your **Supabase SQL Editor**:

```sql
-- Drop expenses and my_finances tables and related objects
-- Run this in your Supabase SQL editor

-- Drop credit_cards table and related objects
DROP TABLE IF EXISTS credit_cards CASCADE;

-- Drop expenses table and related objects
DROP TABLE IF EXISTS expenses CASCADE;

-- Drop my_finances table and related objects (if it exists)
DROP TABLE IF EXISTS my_finances CASCADE;

-- Drop any Plaid-related tables (if they exist)
DROP TABLE IF EXISTS plaid_tokens CASCADE;
DROP TABLE IF EXISTS plaid_accounts CASCADE;

-- Note: This will permanently delete all data in these tables
-- Make sure to backup any important data before running this script
```

### **Step 3: Verify Cleanup**
Check that tables are removed:
```sql
-- Verify tables are gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('credit_cards', 'expenses', 'my_finances', 'plaid_tokens', 'plaid_accounts');
```

Should return no results.

### **Step 4: Confirm Application Works**
- Visit your deployed application
- Verify To-Dos functionality works
- Confirm Credit Cards shows placeholder message
- Check that no errors appear in console

## ✅ Next Steps After Cleanup

1. **Create Pull Request**: Merge `release/v3.0.0` to `main`
2. **Deploy**: Netlify will auto-deploy from main
3. **Monitor**: Check deployment at https://fintask.netlify.app
4. **Plan v3.1.0**: Implement manual credit card upload functionality

---

**⚠️ Important**: This cleanup is irreversible. Make sure you have backups if needed.