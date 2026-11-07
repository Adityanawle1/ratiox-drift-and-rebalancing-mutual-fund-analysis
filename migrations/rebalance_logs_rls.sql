-- ============================================================
-- MIGRATION: Create rebalance_logs table and enable RLS
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.rebalance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    orders JSONB NOT NULL,
    new_inflow NUMERIC,
    before_score NUMERIC,
    after_score NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.rebalance_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view own rebalance logs"
  ON public.rebalance_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rebalance logs"
  ON public.rebalance_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rebalance logs"
  ON public.rebalance_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rebalance logs"
  ON public.rebalance_logs FOR DELETE
  USING (auth.uid() = user_id);
