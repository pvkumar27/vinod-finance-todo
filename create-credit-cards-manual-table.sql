-- Create credit_cards_manual table for v3.1.0
-- Run this in your Supabase SQL editor

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create credit_cards_manual table
CREATE TABLE credit_cards_manual (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank text,
  card_type text,
  card_holder text,
  amount_due numeric,
  min_payment_due numeric,
  due_date date,
  last_used_date date,
  credit_limit numeric,
  promo_available boolean,
  promo_used boolean,
  promo_amount_due numeric,
  promo_expiry_date date,
  promo_apr numeric,
  apr_after numeric,
  interest_charge numeric,
  notes text,
  source text DEFAULT 'manual',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE credit_cards_manual ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own credit cards" ON credit_cards_manual
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards" ON credit_cards_manual
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" ON credit_cards_manual
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" ON credit_cards_manual
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_credit_cards_manual_updated_at
  BEFORE UPDATE ON credit_cards_manual
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_credit_cards_manual_user_id ON credit_cards_manual(user_id);
CREATE INDEX idx_credit_cards_manual_due_date ON credit_cards_manual(due_date);
CREATE INDEX idx_credit_cards_manual_source ON credit_cards_manual(source);

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_cards_manual' 
ORDER BY ordinal_position;