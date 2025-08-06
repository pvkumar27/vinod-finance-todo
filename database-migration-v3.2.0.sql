-- Database migration for v3.2.0
-- Add missing columns to credit_cards_simplified table

-- Add promo_used column
ALTER TABLE credit_cards_simplified 
ADD COLUMN promo_used BOOLEAN DEFAULT FALSE;

-- Add notes column
ALTER TABLE credit_cards_simplified 
ADD COLUMN notes TEXT;

-- Update existing records for backward compatibility
UPDATE credit_cards_simplified 
SET card_name = COALESCE(card_name, 'Unknown Card')
WHERE card_name IS NULL OR card_name = '';