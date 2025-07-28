# Database Migrations

## Overview
This directory contains SQL migration files for FinTask database schema changes.

## Migration Files
- `003_create_credit_cards_table.sql` - Creates credit_cards table for v3.0.0

## Running Migrations
Execute the SQL files in Supabase SQL Editor in numerical order.

## Credit Cards Table Features
- **Privacy**: Only stores last 4 digits of card numbers
- **Dual Mode**: Supports both Plaid-synced and manual entries
- **Owner Tracking**: Self or spouse designation
- **Security**: Row Level Security (RLS) enabled
- **Performance**: Indexed on key fields
- **Audit Trail**: Auto-updating timestamps