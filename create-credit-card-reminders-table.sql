-- Create credit_card_reminders table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS credit_card_reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES credit_cards_manual(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Inactivity Warning', 'Promo Expiry', 'Payment Due')),
  date date NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE credit_card_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own reminders" ON credit_card_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON credit_card_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON credit_card_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON credit_card_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_card_reminders_user_id ON credit_card_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_reminders_card_id ON credit_card_reminders(card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_reminders_date ON credit_card_reminders(date);

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'credit_card_reminders' 
ORDER BY ordinal_position;