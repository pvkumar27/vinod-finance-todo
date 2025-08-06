-- Add card_holder column to credit_cards_simplified table
ALTER TABLE credit_cards_simplified 
ADD COLUMN card_holder VARCHAR(50);

-- Update existing records with default value (optional)
-- UPDATE credit_cards_simplified 
-- SET card_holder = 'Vinod' 
-- WHERE card_holder IS NULL;