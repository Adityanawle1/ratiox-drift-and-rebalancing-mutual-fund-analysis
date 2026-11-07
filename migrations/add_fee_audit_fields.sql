-- Migration: Add Mutual Fund fee audit fields to holdings table
-- These columns are optional and only relevant for instrument_type = 'mf'

ALTER TABLE holdings ADD COLUMN IF NOT EXISTS ter DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'unknown';
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS monthly_sip DECIMAL(12,2) DEFAULT NULL;

COMMENT ON COLUMN holdings.ter IS 'Total Expense Ratio (%) for mutual fund holdings';
COMMENT ON COLUMN holdings.plan_type IS 'Fund plan type: regular, direct, or unknown';
COMMENT ON COLUMN holdings.monthly_sip IS 'Monthly SIP amount in INR for transaction charge calculation';

-- Ensure upgrade_intents table exists for tracking pro upgrade interest
CREATE TABLE IF NOT EXISTS upgrade_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on upgrade_intents
ALTER TABLE upgrade_intents ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own upgrade intents
CREATE POLICY "Users can insert own upgrade intents"
  ON upgrade_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own upgrade intents
CREATE POLICY "Users can read own upgrade intents"
  ON upgrade_intents FOR SELECT
  USING (auth.uid() = user_id);
