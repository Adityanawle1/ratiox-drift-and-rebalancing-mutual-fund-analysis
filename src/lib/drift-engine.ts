/**
 * Represents a target asset class allocation in a user's portfolio.
 * Defines the target baseline and the maximum allowable drift threshold.
 */
export type AssetClass = {
  name: string;
  targetPct: number;
  driftThreshold: number;
};

export type HoldingWithValue = {
  id: string;
  symbol: string;
  name: string;
  assetClass: string;
  instrumentType: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  marketValue: number; // quantity × current_live_price
  costBasis: number; // quantity × avg_buy_price
  pnl: number; // market_value - cost_basis
  pnlPercent: number; // (pnl / cost_basis) × 100
  purchaseDate?: string | null;
  holdingPeriodDays?: number;
  taxStatus?: 'LTCG' | 'STCG' | 'unknown';
  cagr?: number;
  livePriceAvailable: boolean;
  ter?: number | null;
  planType?: string | null;
  monthlySip?: number | null;
};

export type DriftResult = {
  assetClass: string;
  targetPct: number;
  currentPct: number;
  drift: number;
  driftThreshold: number;
  status: 'healthy' | 'drifting' | 'critical';
  currentValue: number;
  targetValue: number;
  valueGap: number;
};

export type RebalanceTrade = {
  assetClass: string;
  action: 'buy' | 'sell';
  amountINR: number;
  reason: string;
  taxWarning?: string;
};

export type RebalanceResult = {
  trades: RebalanceTrade[];
  healthScoreBefore: number;
  healthScoreAfter: number;
  totalPortfolioValue: number;
};

import { type Database } from './supabase';

type HoldingRow = Database['public']['Tables']['holdings']['Row'];

// Normalize asset class strings for comparison:
// "mid cap " → "mid cap", "Large Cap Equity" → "large cap equity"
function normalizeAssetClass(s: string): string {
  return s.trim().toLowerCase();
}

// Calculate market values and PnL for holdings with live prices
export function enrichHoldingsWithMarketData(
  holdings: HoldingRow[],
  livePrices: Record<string, number>
): HoldingWithValue[] {
  return holdings.map((h) => {
    const livePrice = livePrices[h.symbol];
    const currentPrice = livePrice || h.current_price || h.avg_buy_price;
    const livePriceAvailable = !!livePrice;
    
    // Financial calculations
    const marketValue = h.quantity * currentPrice;
    const costBasis = h.quantity * h.avg_buy_price;
    const pnl = marketValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    
    // Tax and CAGR calculations
    let holdingPeriodDays: number | undefined;
    let taxStatus: 'LTCG' | 'STCG' | 'unknown' = 'unknown';
    let cagr: number | undefined;
    
    if (h.purchase_date) {
      const purchaseDate = new Date(h.purchase_date);
      const today = new Date();
      holdingPeriodDays = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Tax status based on holding period
      if (holdingPeriodDays > 365) {
        taxStatus = 'LTCG'; // Long term capital gains - 12.5% tax above ₹1.25L exemption
      } else {
        taxStatus = 'STCG'; // Short term capital gains - 20% tax
      }
      
      // CAGR calculation: ((current_price / avg_buy_price) ^ (365 / holding_period_days) - 1) × 100
      // Bug 3 fix: Only compute CAGR if holding period >= 30 days to avoid misleading annualization
      if (holdingPeriodDays >= 30) {
        const totalReturn = currentPrice / h.avg_buy_price;
        const annualizedReturn = Math.pow(totalReturn, 365 / holdingPeriodDays);
        cagr = (annualizedReturn - 1) * 100;
      }
      // If < 30 days, cagr stays undefined → UI will not show it
    }
    
    return {
      id: h.id,
      symbol: h.symbol,
      name: h.name || h.symbol,
      assetClass: h.asset_class,
      instrumentType: h.instrument_type || 'equity',
      quantity: h.quantity,
      avgBuyPrice: h.avg_buy_price,
      currentPrice,
      marketValue,
      costBasis,
      pnl,
      pnlPercent,
      purchaseDate: h.purchase_date,
      holdingPeriodDays,
      taxStatus,
      cagr,
      livePriceAvailable,
      ter: h.ter,
      planType: h.plan_type,
      monthlySip: h.monthly_sip,
    };
  });
}

export function calculateDrift(
  holdings: HoldingWithValue[],
  targets: AssetClass[]
): DriftResult[] {
  // Calculate total portfolio value using market values (not cost basis)
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  if (totalValue === 0) return [];

  // Group holdings by NORMALIZED asset class and sum their market values
  // Skip holdings with empty asset_class — they can't be grouped
  const valueByNormClass: Record<string, number> = {};
  for (const h of holdings) {
    const normKey = normalizeAssetClass(h.assetClass);
    if (!normKey) continue; // skip empty asset_class
    valueByNormClass[normKey] = (valueByNormClass[normKey] || 0) + h.marketValue;
  }

  return targets.map((target) => {
    const normTarget = normalizeAssetClass(target.name);
    
    // Exact normalized match only — no partial/substring matching
    const currentValue = valueByNormClass[normTarget] || 0;
    

    
    const currentPct = (currentValue / totalValue) * 100;
    const drift = currentPct - target.targetPct;
    const absDrift = Math.abs(drift);

    let status: DriftResult['status'] = 'healthy';
    if (absDrift >= target.driftThreshold) status = 'critical';
    else if (absDrift >= target.driftThreshold * 0.6) status = 'drifting';

    return {
      assetClass: target.name,
      targetPct: target.targetPct,
      currentPct: parseFloat(currentPct.toFixed(2)),
      drift: parseFloat(drift.toFixed(2)),
      driftThreshold: target.driftThreshold,
      status,
      currentValue,
      targetValue: (target.targetPct / 100) * totalValue,
      valueGap: ((target.targetPct / 100) * totalValue) - currentValue,
    };
  });
}

// Fixed health score calculation based on actual deviation from targets
export function calculateHealthScore(driftResults: DriftResult[]): number {
  if (driftResults.length === 0) return 0;

  // Calculate average absolute deviation from target allocations
  const deviations = driftResults.map(d => Math.abs(d.drift));
  const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
  
  // Health score: 100 - (avg_deviation × 2)
  // Perfectly balanced portfolio (0% deviation) → 100
  // 50% average deviation → 0 score
  const healthScore = Math.max(0, 100 - (avgDeviation * 2));
  return parseFloat(healthScore.toFixed(1));
}

export function generateRebalanceTrades(
  driftResults: DriftResult[],
  holdings: HoldingWithValue[],
  newInflowINR: number = 0
): RebalanceTrade[] {
  const trades: RebalanceTrade[] = [];
  const totalPortfolioValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalToAllocate = totalPortfolioValue + newInflowINR;
  
  // Recalculate target values with new inflow
  const adjustedDrift = driftResults.map(d => {
    const newTargetValue = (d.targetPct / 100) * totalToAllocate;
    const difference = newTargetValue - d.currentValue;
    return { ...d, targetValue: newTargetValue, valueGap: difference };
  });
  
  // Generate trades - SELL orders first, then BUY orders
  const sellTrades: RebalanceTrade[] = [];
  const buyTrades: RebalanceTrade[] = [];
  
  for (const d of adjustedDrift) {
    const absGap = Math.abs(d.valueGap);
    
    // Skip if difference is less than 1% of total portfolio
    if (absGap < totalToAllocate * 0.01) continue;
    
    if (d.valueGap < 0) {
      // Need to SELL (overweight)
      const taxWarning = generateTaxWarning(d.assetClass, holdings);
      sellTrades.push({
        assetClass: d.assetClass,
        action: 'sell',
        amountINR: parseFloat(absGap.toFixed(2)),
        reason: `${d.assetClass} is ${Math.abs(d.drift).toFixed(1)}% overweight`,
        taxWarning,
      });
    } else if (d.valueGap > 0) {
      // Need to BUY (underweight)
      buyTrades.push({
        assetClass: d.assetClass,
        action: 'buy',
        amountINR: parseFloat(absGap.toFixed(2)),
        reason: `${d.assetClass} is ${Math.abs(d.drift).toFixed(1)}% underweight`,
      });
    }
  }
  
  // Return SELL orders first, then BUY orders (user should sell before buying)
  return [...sellTrades, ...buyTrades];
}

// Generate tax warnings for SELL orders
function generateTaxWarning(assetClass: string, holdings: HoldingWithValue[]): string {
  // Use exact normalized comparison for tax warning grouping
  const normTarget = normalizeAssetClass(assetClass);
  const classHoldings = holdings.filter(h => normalizeAssetClass(h.assetClass) === normTarget);
  
  if (classHoldings.length === 0) return '';
  
  const hasSTCG = classHoldings.some(h => h.taxStatus === 'STCG');
  const hasLTCG = classHoldings.some(h => h.taxStatus === 'LTCG');
  const hasUnknown = classHoldings.some(h => h.taxStatus === 'unknown');
  
  if (hasSTCG && hasLTCG) {
    return 'Note: Mixed tax implications — some STCG (20% tax), some LTCG (12.5% above ₹1.25L exemption)';
  } else if (hasSTCG) {
    return 'Note: Short term holding — 20% tax may apply if realized';
  } else if (hasLTCG) {
    return 'Note: Long term holding — 12.5% tax above ₹1.25L exemption if realized';
  } else if (hasUnknown) {
    return 'Note: Tax status unknown — add purchase date for visibility';
  }
  
  return '';
}

export function analyzeRebalance(
  holdings: HoldingWithValue[],
  targets: AssetClass[],
  newInflowINR: number = 0
): RebalanceResult {
  const driftResults = calculateDrift(holdings, targets);
  const healthScoreBefore = calculateHealthScore(driftResults);
  const trades = generateRebalanceTrades(driftResults, holdings, newInflowINR);
  const totalPortfolioValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  
  // Simulate post-rebalance state for health score calculation
  const totalAfter = totalPortfolioValue + newInflowINR;
  const valueByClass: Record<string, number> = {};
  
  // Start with current values - use normalized keys, skip empty asset_class
  for (const h of holdings) {
    const normKey = normalizeAssetClass(h.assetClass);
    if (!normKey) continue;
    valueByClass[normKey] = (valueByClass[normKey] || 0) + h.marketValue;
  }
  
  // Apply trades to simulate post-rebalance values
  for (const trade of trades) {
    const delta = trade.action === 'buy' ? trade.amountINR : -trade.amountINR;
    const normKey = normalizeAssetClass(trade.assetClass);
    valueByClass[normKey] = (valueByClass[normKey] || 0) + delta;
  }

  // Calculate post-rebalance drift
  const simulatedDrift: DriftResult[] = targets.map((target) => {
    const normTarget = normalizeAssetClass(target.name);
    const currentValue = valueByClass[normTarget] || 0;
    const currentPct = totalAfter > 0 ? (currentValue / totalAfter) * 100 : 0;
    const drift = currentPct - target.targetPct;
    const absDrift = Math.abs(drift);
    
    let status: DriftResult['status'] = 'healthy';
    if (absDrift >= target.driftThreshold) status = 'critical';
    else if (absDrift >= target.driftThreshold * 0.6) status = 'drifting';
    
    return {
      assetClass: target.name,
      targetPct: target.targetPct,
      currentPct: parseFloat(currentPct.toFixed(2)),
      drift: parseFloat(drift.toFixed(2)),
      driftThreshold: target.driftThreshold,
      status,
      currentValue,
      targetValue: (target.targetPct / 100) * totalAfter,
      valueGap: ((target.targetPct / 100) * totalAfter) - currentValue,
    };
  });

  const healthScoreAfter = calculateHealthScore(simulatedDrift);

  return { trades, healthScoreBefore, healthScoreAfter, totalPortfolioValue };
}
