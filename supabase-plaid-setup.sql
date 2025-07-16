-- Create plaid_tokens table for storing Plaid access tokens securely
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

-- Add RLS policy for plaid_tokens
ALTER TABLE plaid_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tokens
CREATE POLICY "Users can view their own plaid tokens" ON plaid_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own plaid tokens" ON plaid_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update their own plaid tokens" ON plaid_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete their own plaid tokens" ON plaid_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Add plaid_account_id column to credit_cards table for linking
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT;