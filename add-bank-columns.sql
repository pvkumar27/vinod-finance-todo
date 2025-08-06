-- Add new columns to credit_cards_simplified table
ALTER TABLE credit_cards_simplified 
ADD COLUMN bank_name TEXT,
ADD COLUMN last_four_digits TEXT,
ADD COLUMN card_type TEXT;

-- Update existing records to populate card_name if bank_name and last_four_digits are available
-- This is for backward compatibility
UPDATE credit_cards_simplified 
SET card_name = COALESCE(card_name, 'Unknown Card')
WHERE card_name IS NULL OR card_name = '';