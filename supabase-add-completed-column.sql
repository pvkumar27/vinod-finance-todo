-- Add completed column to todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Update existing todos to have completed = false if null
UPDATE todos 
SET completed = FALSE 
WHERE completed IS NULL;