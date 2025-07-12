-- 1. Create credit_cards table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  bank_name TEXT,
  card_type TEXT,
  promo_apr DECIMAL(5,2),
  promo_expiry DATE,
  last_activity DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on credit_cards table
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for users to only access their own cards
CREATE POLICY "Users can only access their own credit cards" ON credit_cards
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to automatically set user_id
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for updated_at
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();