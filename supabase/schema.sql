-- Anvil CRM Database Schema
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- ============================================================
-- CONTACTS
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  company text not null default '',
  role text not null default '',
  phone text not null default '',
  website text not null default '',
  industry text not null default '',
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
  user_id uuid references auth.users(id),
  contact_id uuid references public.contacts(id) on delete cascade,
  title text not null,
  amount decimal not null default 0,
  stage text not null default 'discovery'
    check (stage in ('discovery', 'pricing', 'negotiating', 'closing')),
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
  user_id uuid references auth.users(id),
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
-- COMPANY INTEL (AI-generated briefs per contact)
-- ============================================================
create table if not exists public.company_intel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  contact_id uuid references public.contacts(id) on delete cascade,
  brief text not null default '',
  website_used text not null default '',
  sections jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, contact_id)
);

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_contacts_status on public.contacts(status);
create index if not exists idx_deals_user_id on public.deals(user_id);
create index if not exists idx_deals_stage on public.deals(stage);
create index if not exists idx_deals_contact_id on public.deals(contact_id);
create index if not exists idx_activities_user_id on public.activities(user_id);
create index if not exists idx_activities_contact_id on public.activities(contact_id);
create index if not exists idx_activities_created_at on public.activities(created_at desc);
create index if not exists idx_company_intel_user_id on public.company_intel(user_id);
create index if not exists idx_company_intel_contact_id on public.company_intel(contact_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.company_intel enable row level security;

-- Grant table permissions to authenticated role only
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.deals to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.company_intel to authenticated;

-- RLS policies: shared read, owner-only write
drop policy if exists "Users can manage their own contacts" on public.contacts;
drop policy if exists "Users can manage their own deals" on public.deals;
drop policy if exists "Users can manage their own activities" on public.activities;
drop policy if exists "Users can manage their own company intel" on public.company_intel;
drop policy if exists "Anyone can view contacts" on public.contacts;
drop policy if exists "Anyone can view deals" on public.deals;
drop policy if exists "Anyone can view activities" on public.activities;
drop policy if exists "Anyone can view company intel" on public.company_intel;
drop policy if exists "Users can insert their own contacts" on public.contacts;
drop policy if exists "Users can insert their own deals" on public.deals;
drop policy if exists "Users can insert their own activities" on public.activities;
drop policy if exists "Users can insert their own company intel" on public.company_intel;
drop policy if exists "Users can update their own contacts" on public.contacts;
drop policy if exists "Users can update their own deals" on public.deals;
drop policy if exists "Users can update their own activities" on public.activities;
drop policy if exists "Users can update their own company intel" on public.company_intel;
drop policy if exists "Users can delete their own contacts" on public.contacts;
drop policy if exists "Users can delete their own deals" on public.deals;
drop policy if exists "Users can delete their own activities" on public.activities;
drop policy if exists "Users can delete their own company intel" on public.company_intel;
drop policy if exists "Authenticated users can update any contact" on public.contacts;
drop policy if exists "Authenticated users can update any deal" on public.deals;
drop policy if exists "Authenticated users can update any activity" on public.activities;
drop policy if exists "Authenticated users can update any company intel" on public.company_intel;
drop policy if exists "Authenticated users can delete any contact" on public.contacts;
drop policy if exists "Authenticated users can delete any deal" on public.deals;
drop policy if exists "Authenticated users can delete any activity" on public.activities;
drop policy if exists "Authenticated users can delete any company intel" on public.company_intel;

-- CONTACTS
create policy "Anyone can view contacts"
  on public.contacts for select using (true);
create policy "Users can insert their own contacts"
  on public.contacts for insert with check (auth.uid() = user_id);
create policy "Authenticated users can update any contact"
  on public.contacts for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Authenticated users can delete any contact"
  on public.contacts for delete using (auth.uid() is not null);

-- DEALS
create policy "Anyone can view deals"
  on public.deals for select using (true);
create policy "Users can insert their own deals"
  on public.deals for insert with check (auth.uid() = user_id);
create policy "Authenticated users can update any deal"
  on public.deals for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Authenticated users can delete any deal"
  on public.deals for delete using (auth.uid() is not null);

-- ACTIVITIES
create policy "Anyone can view activities"
  on public.activities for select using (true);
create policy "Users can insert their own activities"
  on public.activities for insert with check (auth.uid() = user_id);
create policy "Authenticated users can update any activity"
  on public.activities for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Authenticated users can delete any activity"
  on public.activities for delete using (auth.uid() is not null);

-- COMPANY INTEL
create policy "Anyone can view company intel"
  on public.company_intel for select using (true);
create policy "Users can insert their own company intel"
  on public.company_intel for insert with check (auth.uid() = user_id);
create policy "Authenticated users can update any company intel"
  on public.company_intel for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Authenticated users can delete any company intel"
  on public.company_intel for delete using (auth.uid() is not null);
