-- Company Intel: stores the AI-generated brief per contact
-- Run this in the Supabase SQL Editor

create table if not exists public.company_intel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  contact_id uuid references public.contacts(id) on delete cascade,
  brief text not null default '',
  website_used text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, contact_id)
);

create index if not exists idx_company_intel_user_id on public.company_intel(user_id);
create index if not exists idx_company_intel_contact_id on public.company_intel(contact_id);

alter table public.company_intel enable row level security;

grant select, insert, update, delete on public.company_intel to authenticated;

create policy "Users can manage their own company intel"
  on public.company_intel for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
