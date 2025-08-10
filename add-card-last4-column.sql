-- Add card_last4 column to credit_cards_simplified table
-- Run this in your Supabase SQL editor

ALTER TABLE credit_cards_simplified 
ADD COLUMN IF NOT EXISTS card_last4 text;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'credit_cards_simplified' 
AND column_name = 'card_last4';