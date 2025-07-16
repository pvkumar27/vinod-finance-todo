-- Safe Plaid setup - only creates what doesn't exist

-- Create plaid_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS plaid_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  institution_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS if not already enabled
ALTER TABLE plaid_tokens ENABLE ROW LEVEL SECURITY;

-- Add plaid_account_id column to credit_cards table if it doesn't exist
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT;