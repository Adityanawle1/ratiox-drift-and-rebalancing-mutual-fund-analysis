import { supabase, type Json } from '@/lib/supabase';

// Risk Profile Templates
export const RISK_PROFILES = {
  conservative: {
    name: 'Conservative',
    description: 'Lower volatility profile',
    allocations: [
      { asset_class: 'Large Cap Equity', target_pct: 40, drift_threshold: 5 },
      { asset_class: 'Debt', target_pct: 35, drift_threshold: 5 },
      { asset_class: 'Gold', target_pct: 10, drift_threshold: 3 },
      { asset_class: 'Mid Cap Equity', target_pct: 10, drift_threshold: 5 },
      { asset_class: 'Cash', target_pct: 5, drift_threshold: 2 },
    ],
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced allocation profile',
    allocations: [
      { asset_class: 'Large Cap Equity', target_pct: 30, drift_threshold: 5 },
      { asset_class: 'Mid Cap Equity', target_pct: 25, drift_threshold: 5 },
      { asset_class: 'Debt', target_pct: 20, drift_threshold: 5 },
      { asset_class: 'Small Cap Equity', target_pct: 15, drift_threshold: 5 },
      { asset_class: 'Gold', target_pct: 10, drift_threshold: 3 },
    ],
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Higher equity allocation profile',
    allocations: [
      { asset_class: 'Mid Cap Equity', target_pct: 30, drift_threshold: 5 },
      { asset_class: 'Small Cap Equity', target_pct: 25, drift_threshold: 5 },
      { asset_class: 'Large Cap Equity', target_pct: 20, drift_threshold: 5 },
      { asset_class: 'Debt', target_pct: 15, drift_threshold: 5 },
      { asset_class: 'Gold', target_pct: 5, drift_threshold: 3 },
      { asset_class: 'International Equity', target_pct: 5, drift_threshold: 3 },
    ],
  },
};

// User Profile Management
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  
  // If risk_profile column doesn't exist, add a default value
  if (data && !Object.prototype.hasOwnProperty.call(data, 'risk_profile')) {
    data.risk_profile = null;
  }
  
  return { data, error };
};

export const updateUserProfile = (userId: string, updates: Record<string, unknown>) =>
  supabase.from('profiles').update(updates).eq('id', userId);

export const setUserRiskProfile = async (userId: string, riskProfile: keyof typeof RISK_PROFILES) => {
  try {
    // First, always set onboarded to true regardless of risk_profile column
    const { error: onboardedError } = await supabase
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', userId);

    if (onboardedError) {
      console.error('Failed to set onboarded status:', onboardedError);
    }

    // Try to set risk_profile if column exists
    const { error: riskProfileError } = await supabase
      .from('profiles')
      .update({ risk_profile: riskProfile })
      .eq('id', userId);

    if (riskProfileError && riskProfileError.message.includes('risk_profile')) {
      console.warn('risk_profile column not found, but onboarded status was set');
    }

    // Get or create portfolio
    const { data: portfolios } = await getUserPortfolios(userId);
    let portfolio = portfolios?.[0];
    
    if (!portfolio) {
      const { data: newPortfolio, error: portfolioError } = await createPortfolio(userId, 'My Portfolio');
      if (portfolioError) return { error: portfolioError };
      portfolio = newPortfolio;
    }

    // Set target allocations based on risk profile
    const profile = RISK_PROFILES[riskProfile];
    const { error: targetsError } = await upsertAssetTargets(portfolio.id, profile.allocations);
    
    return { error: targetsError, portfolio };
    
  } catch (err) {
    console.error('Unexpected error in setUserRiskProfile:', err);
    
    // As a last resort, just try to set onboarded = true
    try {
      await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', userId);
    } catch (finalErr) {
      console.error('Failed to set onboarded as fallback:', finalErr);
    }
    
    return { error: null, portfolio: null };
  }
};

// Portfolios
export const getUserPortfolios = (userId: string) =>
  supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at');

export const createPortfolio = (userId: string, name: string) =>
  supabase.from('portfolios').insert({ user_id: userId, name }).select().single();

// Asset Targets
export const getAssetTargets = (portfolioId: string) =>
  supabase.from('asset_targets').select('*').eq('portfolio_id', portfolioId);

export const upsertAssetTargets = async (
  portfolioId: string,
  targets: { asset_class: string; target_pct: number; drift_threshold: number }[]
) => {
  // Validate that targets sum to 100%
  const totalPct = targets.reduce((sum, t) => sum + t.target_pct, 0);
  if (Math.abs(totalPct - 100) > 0.01) {
    return { error: new Error('Target allocations must sum to exactly 100%') };
  }

  await supabase.from('asset_targets').delete().eq('portfolio_id', portfolioId);
  return supabase
    .from('asset_targets')
    .insert(targets.map((t) => ({ ...t, portfolio_id: portfolioId })));
};

// Holdings
export const getHoldings = (portfolioId: string) =>
  supabase.from('holdings').select('*').eq('portfolio_id', portfolioId).order('asset_class');

export const addHolding = async (data: {
  portfolio_id: string;
  user_id: string;
  symbol: string;
  name?: string;
  asset_class: string;
  instrument_type?: string;
  quantity: number;
  avg_buy_price: number;
  purchase_date?: string | null;
  ter?: number;
  plan_type?: string;
  monthly_sip?: number;
}) => {
  // Validation
  if (data.quantity <= 0) {
    return { error: new Error('Quantity must be greater than 0') };
  }
  if (data.avg_buy_price <= 0) {
    return { error: new Error('Average buy price must be greater than 0') };
  }
  if (data.purchase_date) {
    const purchaseDate = new Date(data.purchase_date);
    const today = new Date();
    if (purchaseDate > today) {
      return { error: new Error('Purchase date cannot be in the future') };
    }
  }

  // Check for existing holding with same symbol and asset class
  const { data: existingHoldings } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', data.portfolio_id)
    .eq('symbol', data.symbol.toUpperCase())
    .eq('asset_class', data.asset_class);

  if (existingHoldings && existingHoldings.length > 0) {
    // Merge with existing holding - calculate blended average price
    const existing = existingHoldings[0];
    const totalQuantity = existing.quantity + data.quantity;
    const blendedAvgPrice = 
      (existing.quantity * existing.avg_buy_price + data.quantity * data.avg_buy_price) / totalQuantity;

    return supabase
      .from('holdings')
      .update({
        quantity: totalQuantity,
        avg_buy_price: blendedAvgPrice,
        // Keep the earlier purchase date if both exist
        purchase_date: existing.purchase_date && data.purchase_date 
          ? (new Date(existing.purchase_date) < new Date(data.purchase_date) 
             ? existing.purchase_date 
             : data.purchase_date)
          : existing.purchase_date || data.purchase_date,
        // Update TER/SIP/Plan Type if provided, else keep existing
        ter: data.ter !== undefined ? data.ter : existing.ter,
        plan_type: data.plan_type !== undefined ? data.plan_type : existing.plan_type,
        monthly_sip: data.monthly_sip !== undefined ? data.monthly_sip : existing.monthly_sip,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
  }

  // Create new holding
  return supabase.from('holdings').insert({
    ...data,
    symbol: data.symbol.toUpperCase(),
  }).select().single();
};

export const addHoldingsBatch = async (
  portfolioId: string,
  userId: string,
  holdingsData: {
    symbol: string;
    assetClass: string;
    quantity: number;
    avgPrice: number;
  }[]
) => {
  // 1. Fetch current holdings
  const { data: existingHoldings, error: fetchError } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId);

  if (fetchError) return { error: fetchError, successCount: 0 };

  // 2. Combine duplicate symbols from the CSV itself
  const consolidatedIncoming: Record<string, typeof holdingsData[0]> = {};
  for (const item of holdingsData) {
    const key = `${item.symbol.toUpperCase()}_${item.assetClass}`;
    if (consolidatedIncoming[key]) {
      const existing = consolidatedIncoming[key];
      const totalQty = existing.quantity + item.quantity;
      existing.avgPrice = (existing.quantity * existing.avgPrice + item.quantity * item.avgPrice) / totalQty;
      existing.quantity = totalQty;
    } else {
      consolidatedIncoming[key] = { ...item };
    }
  }

  const inserts = [];
  const updates = [];

  // 3. Distribute into INSERTS or UPDATES based on DB
  for (const item of Object.values(consolidatedIncoming)) {
    const existing = existingHoldings?.find((h: { symbol: string; asset_class: string; quantity: number; avg_buy_price: number; id: string }) => h.symbol === item.symbol.toUpperCase() && h.asset_class === item.assetClass);
    
    if (existing) {
      const totalQuantity = existing.quantity + item.quantity;
      const blendedAvgPrice = 
        (existing.quantity * existing.avg_buy_price + item.quantity * item.avgPrice) / totalQuantity;
      
      updates.push(
        supabase.from('holdings').update({
          quantity: totalQuantity,
          avg_buy_price: blendedAvgPrice,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id)
      );
    } else {
      inserts.push({
        portfolio_id: portfolioId,
        user_id: userId,
        symbol: item.symbol.toUpperCase(),
        asset_class: item.assetClass,
        instrument_type: "equity",
        quantity: item.quantity,
        avg_buy_price: item.avgPrice,
      });
    }
  }

  let successCount = 0;

  // 4. Execute inserts in ONE query
  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from('holdings').insert(inserts);
    if (!insertError) successCount += inserts.length;
  }

  // 5. Execute updates concurrently in chunks
  const chunkSize = 5;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const results = await Promise.all(chunk);
    successCount += results.filter(r => !r.error).length;
  }

  return { error: null, successCount };
};

export const updateHoldingData = (
  id: string,
  data: {
    quantity?: number;
    avg_buy_price?: number;
    purchase_date?: string | null;
    ter?: number | null;
    plan_type?: string | null;
    monthly_sip?: number | null;
  }
) =>
  supabase.from('holdings').update({
    ...data,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();

export const updateHoldingPrice = (id: string, price: number) =>
  supabase.from('holdings').update({
    current_price: price,
    last_price_updated: new Date().toISOString(),
  }).eq('id', id);

export const deleteHolding = (id: string) =>
  supabase.from('holdings').delete().eq('id', id);

// Transactions
export const addTransaction = (data: {
  portfolio_id: string;
  user_id: string;
  symbol: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  notes?: string;
}) => supabase.from('transactions').insert(data).select().single();

export const getTransactions = (portfolioId: string) =>
  supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('transacted_at', { ascending: false });

// Rebalance Events
export const saveRebalanceEvent = (data: {
  portfolio_id: string;
  user_id: string;
  snapshot: Json;
  trades: Json;
  health_score_before: number;
  health_score_after: number;
  status?: 'suggested' | 'executed' | 'dismissed';
}) => supabase.from('rebalance_events').insert(data).select().single();

export const getRebalanceHistory = (portfolioId: string) =>
  supabase
    .from('rebalance_events')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false })
    .limit(20);

export const updateRebalanceStatus = (
  id: string,
  status: 'suggested' | 'executed' | 'dismissed'
) => supabase.from('rebalance_events').update({ status }).eq('id', id);

// Rebalance Logs (Manual History)
export const saveRebalanceLog = (data: {
  user_id: string;
  portfolio_id: string;
  orders: Json;
  new_inflow: number;
  before_score: number;
  after_score: number;
  status?: string;
}) => 
  supabase.from('rebalance_logs').insert({
    ...data,
    created_at: new Date().toISOString(),
  }).select().single();

export const getRebalanceLogs = (portfolioId: string) =>
  supabase
    .from('rebalance_logs')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false })
    .limit(20);

// Alerts
export const getUnreadAlerts = (portfolioId: string) =>
  supabase
    .from('alerts')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('read', false)
    .order('created_at', { ascending: false });

export const markAlertRead = (id: string) =>
  supabase.from('alerts').update({ read: true }).eq('id', id);
