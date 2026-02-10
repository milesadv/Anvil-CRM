-- Shared read access: all authenticated users can view all contacts, deals, activities
-- But only the owner can insert/update/delete their own records
-- Run this in the Supabase SQL Editor

-- Drop existing all-in-one policies
drop policy if exists "Users can manage their own contacts" on public.contacts;
drop policy if exists "Users can manage their own deals" on public.deals;
drop policy if exists "Users can manage their own activities" on public.activities;
drop policy if exists "Users can manage their own company intel" on public.company_intel;

-- CONTACTS: anyone can read, only owner can write
create policy "Anyone can view contacts"
  on public.contacts for select
  using (true);

create policy "Users can insert their own contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
  on public.contacts for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);

-- DEALS: anyone can read, only owner can write
create policy "Anyone can view deals"
  on public.deals for select
  using (true);

create policy "Users can insert their own deals"
  on public.deals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own deals"
  on public.deals for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own deals"
  on public.deals for delete
  using (auth.uid() = user_id);

-- ACTIVITIES: anyone can read, only owner can write
create policy "Anyone can view activities"
  on public.activities for select
  using (true);

create policy "Users can insert their own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own activities"
  on public.activities for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own activities"
  on public.activities for delete
  using (auth.uid() = user_id);

-- COMPANY INTEL: anyone can read, only owner can write
create policy "Anyone can view company intel"
  on public.company_intel for select
  using (true);

create policy "Users can insert their own company intel"
  on public.company_intel for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own company intel"
  on public.company_intel for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own company intel"
  on public.company_intel for delete
  using (auth.uid() = user_id);
