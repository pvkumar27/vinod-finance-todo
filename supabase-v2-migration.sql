-- v2.0.0 Migration: Add owner and sync_source fields, clear data

-- Add new columns to credit_cards_simplified table
ALTER TABLE credit_cards_simplified 
ADD COLUMN owner TEXT DEFAULT 'self',
ADD COLUMN sync_source TEXT DEFAULT 'Manual';

-- Add new columns to expenses table (finances)
ALTER TABLE expenses 
ADD COLUMN owner TEXT DEFAULT 'self',
ADD COLUMN sync_source TEXT DEFAULT 'Manual';

-- Clear all existing data
DELETE FROM credit_cards_simplified;
DELETE FROM expenses;

-- Update RLS policies to ensure users only see their own data
-- (Assuming RLS is already set up, this is just a reminder)
-- The existing RLS policies should already handle user isolation via auth.uid()