-- Add industry column to contacts table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS industry text NOT NULL DEFAULT '';
