-- Anvil CRM Database Schema
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- ============================================================
-- CONTACTS
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null default '',
  role text not null default '',
  phone text not null default '',
  status text not null default 'lead'
    check (status in ('lead', 'prospect', 'customer', 'churned')),
  last_contact date not null default current_date,
  avatar text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  title text not null,
  amount decimal not null default 0,
  stage text not null default 'prospecting'
    check (stage in ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability integer not null default 0
    check (probability >= 0 and probability <= 100),
  expected_close_date date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  type text not null default 'note'
    check (type in ('note', 'email', 'call', 'meeting', 'task')),
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  due_date timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index if not exists idx_contacts_status on public.contacts(status);
create index if not exists idx_deals_stage on public.deals(stage);
create index if not exists idx_deals_contact_id on public.deals(contact_id);
create index if not exists idx_activities_contact_id on public.activities(contact_id);
create index if not exists idx_activities_created_at on public.activities(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;

-- Grant table permissions to anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.contacts to anon, authenticated;
grant select, insert, update, delete on public.deals to anon, authenticated;
grant select, insert, update, delete on public.activities to anon, authenticated;

-- Allow full access for authenticated and anon users (single-user mode)
drop policy if exists "Allow full access to contacts" on public.contacts;
drop policy if exists "Allow full access to deals" on public.deals;
drop policy if exists "Allow full access to activities" on public.activities;

create policy "Allow full access to contacts"
  on public.contacts for all
  using (true) with check (true);

create policy "Allow full access to deals"
  on public.deals for all
  using (true) with check (true);

create policy "Allow full access to activities"
  on public.activities for all
  using (true) with check (true);
