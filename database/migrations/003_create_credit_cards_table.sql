-- Migration: Create credit_cards table for v3.0.0
-- Description: Support both Plaid-synced and manual credit card entries
-- Privacy: Only stores last 4 digits of card numbers
-- Features: Owner tracking, autopay status, Plaid integration ready

-- Create credit_cards table
create table credit_cards (
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
alter table credit_cards enable row level security;

-- RLS Policies for user isolation
create policy "Select own cards"
on credit_cards for select
using (user_id = auth.uid());

create policy "Insert own cards"
on credit_cards for insert
with check (user_id = auth.uid());

create policy "Update own cards"
on credit_cards for update
using (user_id = auth.uid());

create policy "Delete own cards"
on credit_cards for delete
using (user_id = auth.uid());

-- Auto-update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_credit_cards_updated_at
before update on credit_cards
for each row execute function update_updated_at_column();

-- Add indexes for performance
create index idx_credit_cards_user_id on credit_cards(user_id);
create index idx_credit_cards_plaid_account_id on credit_cards(plaid_account_id);
create index idx_credit_cards_sync_source on credit_cards(sync_source);