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