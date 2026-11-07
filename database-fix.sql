so -- Add missing risk_profile column to profiles table
-- Run this SQL command in your Supabase SQL Editor
but 
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS risk_profile TEXT;

-- Optional: Add a check constraint to ensure only valid risk profiles
ALTER TABLE profiles 
ADD CONSTRAINT check_risk_profile 
CHECK (risk_profile IS NULL OR risk_profile IN ('conservative', 'moderate', 'aggressive'));