-- Add missing promo_used column to credit_cards_simplified table
ALTER TABLE credit_cards_simplified 
ADD COLUMN promo_used BOOLEAN DEFAULT FALSE;

-- Update existing records to populate card_name if bank_name and last_four_digits are available
-- This is for backward compatibility
UPDATE credit_cards_simplified 
SET card_name = COALESCE(card_name, 'Unknown Card')
WHERE card_name IS NULL OR card_name = '';