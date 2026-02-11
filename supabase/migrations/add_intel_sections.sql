-- Add JSONB sections column to company_intel
-- Stores on-demand intel sections (objections, key questions, etc.)
-- Run this in the Supabase SQL Editor

alter table public.company_intel
  add column if not exists sections jsonb not null default '{}'::jsonb;
