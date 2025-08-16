-- Migration: Create credit_cards_simplified table for v3.0.0
-- Description: Support both Plaid-synced and manual credit card entries
-- Privacy: Only stores last 4 digits of card numbers
-- Features: Owner tracking, autopay status, Plaid integration ready

-- Create credit_cards_simplified table
create table if not exists credit_cards_simplified (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  bank_name text,
  card_type text,
  last4 text,
  account_nickname text,
  account_owner text,
  opened_date date,
  due_date date,
  closing_date date,
  statement_date date,
  credit_limit numeric,
  current_balance numeric,
  minimum_due numeric,
  apr_type text,
  purchase_apr numeric,
  bt_apr numeric,
  cash_apr numeric,
  promo_apr boolean default false,
  promo_end_date date,
  sync_source text default 'Manual',
  owner text default 'self',
  autopay boolean default false,
  last_transaction_date date,
  plaid_account_id text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table credit_cards_simplified enable row level security;

-- RLS Policies for user isolation
do $$ 
declare
  table_name text := 'credit_cards_simplified';
begin
  if not exists (select 1 from pg_policies where tablename = table_name and policyname = 'Select own cards') then
    execute format('create policy "Select own cards" on %I for select using (user_id = auth.uid())', table_name);
  end if;
  if not exists (select 1 from pg_policies where tablename = table_name and policyname = 'Insert own cards') then
    execute format('create policy "Insert own cards" on %I for insert with check (user_id = auth.uid())', table_name);
  end if;
  if not exists (select 1 from pg_policies where tablename = table_name and policyname = 'Update own cards') then
    execute format('create policy "Update own cards" on %I for update using (user_id = auth.uid())', table_name);
  end if;
  if not exists (select 1 from pg_policies where tablename = table_name and policyname = 'Delete own cards') then
    execute format('create policy "Delete own cards" on %I for delete using (user_id = auth.uid())', table_name);
  end if;
end $$;

-- Auto-update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_credit_cards_simplified_updated_at on credit_cards_simplified;
create trigger update_credit_cards_simplified_updated_at
before update on credit_cards_simplified
for each row execute function update_updated_at_column();

-- Add indexes for performance
create index if not exists idx_credit_cards_simplified_user_id on credit_cards_simplified(user_id);
create index if not exists idx_credit_cards_simplified_plaid_account_id on credit_cards_simplified(plaid_account_id);
create index if not exists idx_credit_cards_simplified_sync_source on credit_cards_simplified(sync_source);