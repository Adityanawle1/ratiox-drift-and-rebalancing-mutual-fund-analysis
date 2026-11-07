/**
 * Fee Calculator Engine
 * 
 * All SIP compounding formulas use the standard future value of annuity formula:
 *   FV = SIP × [((1 + r)^n - 1) / r]
 * where r = monthly rate, n = total months.
 * 
 * Fee drag = corpus_without_fees - corpus_with_fees
 */

// ─── India MF Category Average TERs ────────────────────────────────
// Source: AMFI/SEBI disclosures, approximate averages for Regular plans
export const CATEGORY_AVG_TER: Record<string, number> = {
  "large cap regular":    1.42,
  "large cap":            1.42,
  "mid cap regular":      1.68,
  "mid cap":              1.68,
  "small cap regular":    1.78,
  "small cap":            1.78,
  "elss regular":         1.54,
  "elss":                 1.54,
  "debt short term":      0.45,
  "debt long term":       0.52,
  "debt":                 0.52,
  "index fund":           0.20,
  "index":                0.20,
  "etf":                  0.15,
  "international":        1.20,
  "balanced":             1.55,
  "hybrid":               1.55,
  "balanced/hybrid":      1.55,
};

const DEFAULT_CATEGORY_AVG_TER = 1.50;

/**
 * Lookup the category average TER for a given asset class string.
 * Falls back to 1.50% if no match found.
 */
export function getCategoryAvgTer(assetClass: string): number {
  const key = assetClass.trim().toLowerCase();
  // Try exact match first
  if (CATEGORY_AVG_TER[key] !== undefined) return CATEGORY_AVG_TER[key];
  // Try partial match
  for (const [k, v] of Object.entries(CATEGORY_AVG_TER)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_CATEGORY_AVG_TER;
}

/**
 * Compute the SIP future value (corpus) using the standard FV annuity formula.
 * 
 * Formula:
 *   corpus = SIP × [((1 + r/12)^(n×12) - 1) / (r/12)]
 * 
 * @param monthlySIP   Monthly SIP amount in ₹
 * @param annualReturn Annual gross return as a decimal (e.g., 0.12 for 12%)
 * @param years        Investment horizon in years
 * @returns            Future corpus value in ₹
 */
export function computeCorpus(monthlySIP: number, annualReturn: number, years: number): number {
  if (annualReturn <= 0 || monthlySIP <= 0 || years <= 0) return monthlySIP * years * 12;
  const monthlyRate = annualReturn / 12;
  const totalMonths = years * 12;
  // FV of annuity: SIP × [((1+r)^n - 1) / r]
  return monthlySIP * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
}

/**
 * Compute corpus for a lump sum (existing portfolio value) growing at a given rate.
 * 
 * Formula: FV = PV × (1 + r/12)^(n×12)
 */
export function computeLumpSumCorpus(principal: number, annualReturn: number, years: number): number {
  if (annualReturn <= 0 || years <= 0) return principal;
  const monthlyRate = annualReturn / 12;
  const totalMonths = years * 12;
  return principal * Math.pow(1 + monthlyRate, totalMonths);
}

/**
 * Get the TER verdict based on comparison to category average.
 * - Efficient: user TER < 85% of category avg
 * - Average:   user TER between 85% and 115% of category avg
 * - Expensive: user TER > 115% of category avg
 */
export function getTerVerdict(userTer: number, categoryAvgTer: number): {
  label: string;
  emoji: string;
  color: "green" | "yellow" | "red";
} {
  if (userTer < categoryAvgTer * 0.85) {
    return { label: "Efficient", emoji: "✅", color: "green" };
  } else if (userTer <= categoryAvgTer * 1.15) {
    return { label: "Average", emoji: "⚠️", color: "yellow" };
  } else {
    return { label: "Expensive", emoji: "🔴", color: "red" };
  }
}

/**
 * Estimate the direct plan TER from a regular plan TER.
 * Average regular-to-direct difference in India is ~0.9%.
 * Floor at 0.1% to avoid negative or zero TER.
 */
export function estimateDirectTer(regularTer: number): number {
  return Math.max(0.1, regularTer - 0.9);
}

/**
 * Generate a year-by-year breakdown of corpus with regular vs direct plan TER.
 * Only returns data for milestone years (1, 5, 10, 15, 20, 25, 30).
 */
export function generateYearlyBreakdown(
  monthlySIP: number,
  grossReturn: number,
  regularTer: number,
  directTer: number,
  maxYears: number
): Array<{
  year: number;
  corpusRegular: number;
  corpusDirect: number;
  feeDrag: number;
}> {
  const milestones = [1, 5, 10, 15, 20, 25, 30].filter(y => y <= maxYears);
  const grossRate = grossReturn / 100;
  const regularRate = grossRate - regularTer / 100;
  const directRate = grossRate - directTer / 100;

  return milestones.map(year => {
    const corpusRegular = computeCorpus(monthlySIP, regularRate, year);
    const corpusDirect = computeCorpus(monthlySIP, directRate, year);
    return {
      year,
      corpusRegular,
      corpusDirect,
      feeDrag: corpusDirect - corpusRegular,
    };
  });
}

/**
 * Compute hidden charges breakdown for a mutual fund holding.
 * 
 * All charges explained:
 * 1. TER — Total Expense Ratio (annual, as % of AUM)
 * 2. Stamp Duty — 0.005% on every purchase
 * 3. STT — 0.001% Securities Transaction Tax on redemption (equity MFs)
 * 4. GST on TER — 18% GST applied to the management fee component
 * 5. Transaction charges — per-SIP charges for regular plans
 */
export function computeHiddenCharges(params: {
  currentValue: number;
  totalInvested: number;
  ter: number;
  isEquity: boolean;
  isRegularPlan: boolean;
  monthlySIP: number;
}): {
  expenseRatioCost: number;
  gstOnTer: number;
  stampDuty: number;
  sttOnRedemption: number;
  transactionCharges: number;
  totalRealCost: number;
  statedTerPct: number;
  realTerPct: number;
} {
  const { currentValue, totalInvested, ter, isEquity, isRegularPlan, monthlySIP } = params;

  // 1. Annual expense ratio cost
  const expenseRatioCost = (currentValue * ter) / 100;

  // 2. GST on TER: 18% GST is applied on the management fee component of the TER
  //    Most investors don't realize the stated TER is before GST on management fees
  const gstOnTer = expenseRatioCost * 0.18;

  // 3. Stamp duty: 0.005% of total invested amount (annual approximation)
  const stampDuty = totalInvested * 0.00005;

  // 4. STT: 0.001% on redemption value (only equity funds, shown as "if redeem today")
  const sttOnRedemption = isEquity ? currentValue * 0.00001 : 0;

  // 5. Transaction charges (Regular plans only):
  //    ₹150 per SIP if SIP > ₹10,000, ₹100 if SIP ≤ ₹10,000
  //    Applied per transaction, so annual = charge × 12
  let transactionCharges = 0;
  if (isRegularPlan && monthlySIP > 0) {
    const perTransaction = monthlySIP > 10000 ? 150 : 100;
    transactionCharges = perTransaction * 12;
  }

  const totalRealCost = expenseRatioCost + gstOnTer + stampDuty + sttOnRedemption + transactionCharges;

  const statedTerPct = ter;
  const realTerPct = currentValue > 0 ? (totalRealCost / currentValue) * 100 : 0;

  return {
    expenseRatioCost,
    gstOnTer,
    stampDuty,
    sttOnRedemption,
    transactionCharges,
    totalRealCost,
    statedTerPct,
    realTerPct,
  };
}

/**
 * Find the year at which cumulative fee drag exceeds total invested amount.
 * Returns null if it never exceeds within 30 years.
 */
export function findFeeExceedsInvestedYear(
  monthlySIP: number,
  grossReturn: number,
  ter: number
): number | null {
  const grossRate = grossReturn / 100;
  const netRate = grossRate - ter / 100;

  for (let year = 1; year <= 30; year++) {
    const totalInvested = monthlySIP * 12 * year;
    const corpusWithout = computeCorpus(monthlySIP, grossRate, year);
    const corpusWith = computeCorpus(monthlySIP, netRate, year);
    const cumulativeFees = corpusWithout - corpusWith;

    if (cumulativeFees > totalInvested) {
      return year;
    }
  }
  return null;
}

/**
 * Format a number in Indian numbering system (₹XX,XX,XXX)
 */
export function formatINR(value: number, decimals = 0): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: decimals });
}
