-- ============================================================
-- MIGRATION: Enable Row Level Security (RLS) on ALL tables
-- Fixes: "Table publicly accessible" critical security issue
-- Date: 2026-04-24
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- ============================================================
-- 1. PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. PORTFOLIOS
-- ============================================================
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolios"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. ASSET_TARGETS
-- ============================================================
ALTER TABLE public.asset_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own asset targets"
  ON public.asset_targets FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own asset targets"
  ON public.asset_targets FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own asset targets"
  ON public.asset_targets FOR UPDATE
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own asset targets"
  ON public.asset_targets FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. HOLDINGS
-- ============================================================
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own holdings"
  ON public.holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON public.holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON public.holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON public.holdings FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 5. TRANSACTIONS
-- ============================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. REBALANCE_EVENTS
-- ============================================================
ALTER TABLE public.rebalance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rebalance events"
  ON public.rebalance_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rebalance events"
  ON public.rebalance_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rebalance events"
  ON public.rebalance_events FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- 7. ALERTS
-- ============================================================
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. UPGRADE_INTENTS
-- ============================================================
ALTER TABLE public.upgrade_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upgrade intents"
  ON public.upgrade_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upgrade intents"
  ON public.upgrade_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 9. WAITLIST (special case — allows anonymous inserts)
-- ============================================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can add themselves to the waitlist (landing page signup)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can view waitlist entries
-- Remove this policy if you don't need to view waitlist from the app
CREATE POLICY "Authenticated users can view waitlist"
  ON public.waitlist FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================
-- DONE! All tables now have RLS enabled.
-- ============================================================
