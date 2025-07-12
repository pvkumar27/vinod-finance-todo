-- Check if set_user_id function exists, if not create it
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for credit_cards
DROP TRIGGER IF EXISTS set_user_id_trigger ON credit_cards;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Verify RLS policy exists
DROP POLICY IF EXISTS "Users can only access their own credit cards" ON credit_cards;
CREATE POLICY "Users can only access their own credit cards" ON credit_cards
  FOR ALL USING (auth.uid() = user_id);