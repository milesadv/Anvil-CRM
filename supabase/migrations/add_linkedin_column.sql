-- Add linkedin column to contacts table
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS linkedin text NOT NULL DEFAULT '';
