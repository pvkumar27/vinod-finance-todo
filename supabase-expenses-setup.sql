-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for users to only access their own expenses
CREATE POLICY "Users can only access their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create trigger to automatically set user_id
CREATE TRIGGER set_user_id_expenses_trigger
  BEFORE INSERT ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- 5. Create trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();