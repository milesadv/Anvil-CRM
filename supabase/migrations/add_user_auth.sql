-- Migration: Add user-scoped authentication
-- Run this in the Supabase SQL Editor after enabling Email auth in Authentication > Providers

-- ============================================================
-- ADD user_id COLUMNS (nullable for existing data)
-- ============================================================
ALTER TABLE public.contacts ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.deals ADD COLUMN user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.activities ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- ============================================================
-- INDEXES for user_id lookups
-- ============================================================
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);

-- ============================================================
-- DROP old open policies
-- ============================================================
DROP POLICY IF EXISTS "Allow full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow full access to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow full access to activities" ON public.activities;

-- ============================================================
-- NEW user-scoped RLS policies
-- ============================================================
CREATE POLICY "Users can manage their own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own deals"
  ON public.deals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REVOKE anon access (only authenticated users)
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contacts FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.deals FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.activities FROM anon;

-- ============================================================
-- CLAIM EXISTING DATA (optional, run after signing up)
-- Replace <your-user-uuid> with your auth.users id
-- ============================================================
-- UPDATE public.contacts SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- UPDATE public.deals SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- UPDATE public.activities SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
