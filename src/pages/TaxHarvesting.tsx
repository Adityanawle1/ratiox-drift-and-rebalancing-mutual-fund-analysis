import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserPortfolios, getHoldings } from "@/api/portfolio";
import { refreshPrices } from "@/lib/market-data";
import { enrichHoldingsWithMarketData, HoldingWithValue } from "@/lib/drift-engine";
import { supabase } from "@/lib/supabase";
import { Lock, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import Disclaimer from "@/components/Disclaimer";

type Tab = "LOSS_HARVESTING" | "LTCG_OPTIMISER";

const TaxHarvesting = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Pro Feature Toggle
  const [isPro] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("LOSS_HARVESTING");
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);

  // Calculations logic
  const calculateData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: portfolios } = await getUserPortfolios(user.id);
      if (portfolios && portfolios.length > 0) {
        const { data: rawHoldings } = await getHoldings(portfolios[0].id);
        if (rawHoldings) {
          const { prices } = await refreshPrices(rawHoldings);
          const enriched = enrichHoldingsWithMarketData(rawHoldings, prices);
          setHoldings(enriched || []);
        }
      }
    } catch (err) {
      console.error("Failed to load tax harvesting data", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateData();
  }, [calculateData]);

  const handleUpgradeIntent = async () => {
    toast.info("Coming soon — you'll be notified");
    if (user) {
      await supabase.from("upgrade_intents").insert({
        user_id: user.id,
        feature: "tax_harvesting",
      });
    }
  };

  // 1. Loss Harvesting Math
  const lossPositions = useMemo(() => holdings.filter(h => h.pnl < 0), [holdings]);
  const gainPositions = useMemo(() => holdings.filter(h => h.pnl > 0), [holdings]);

  const totalUnrealizedGains = gainPositions.reduce((acc, h) => acc + h.pnl, 0);
  const totalHarvestableLosses = lossPositions.reduce((acc, h) => acc + h.pnl, 0);

  const lossSuggestions = useMemo(() => {
    return lossPositions.map(h => {
      const estimatedImpact = Math.abs(h.pnl) * 0.20;
      return { ...h, estimatedImpact };
    });
  }, [lossPositions]);

  // Compute days left in FY (Indian FY ends March 31)
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  let fyEndYear = currentYear;
  if (today.getMonth() >= 3) {
    fyEndYear = currentYear + 1;
  }
  const fyEndDate = new Date(fyEndYear, 2, 31);
  const daysToMarch31 = differenceInDays(fyEndDate, today);

  // 2. LTCG Exemption Math
  const LTCG_EXEMPTION_LIMIT = 125000;
  const ltcgUsedThisFy = 0;
  const exemptionRemaining = LTCG_EXEMPTION_LIMIT - ltcgUsedThisFy;

  const ltcgSuggestions = useMemo(() => {
    const candidates = holdings.filter(h => {
      if (!h.purchaseDate) return false;
      const days = differenceInDays(today, parseISO(h.purchaseDate));
      return days > 365 && h.pnl > 0;
    }).sort((a, b) => b.pnl - a.pnl);

    let remaining = exemptionRemaining;
    const suggestions = [];

    for (const h of candidates) {
      if (remaining <= 0) break;
      const amountToUse = Math.min(h.pnl, remaining);
      const estimatedImpact = amountToUse * 0.125;

      suggestions.push({
        ...h,
        gainUsed: amountToUse,
        estimatedImpact,
        holdingPeriodYrs: (differenceInDays(today, parseISO(h.purchaseDate!)) / 365).toFixed(1)
      });
      remaining -= amountToUse;
    }

    return suggestions;
  }, [holdings, exemptionRemaining, today]);

  const ltcgUsedInSuggestions = ltcgSuggestions.reduce((acc, s) => acc + s.gainUsed, 0);
  const ltcgEstimatedImpact = ltcgSuggestions.reduce((acc, s) => acc + s.estimatedImpact, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold text-amber hover:brightness-110 transition-all">Ratio x</Link>
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard/fee-audit" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber/80 hover:text-amber transition-colors border border-amber/20 bg-amber/5 px-2.5 py-1 rounded-[2px]"
            >
              Fee Audit
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber/80 hover:text-amber transition-colors border border-amber/20 bg-amber/5 px-2.5 py-1 rounded-[2px]"
            >
              Drift Engine
            </Link>
            <Link 
              to="/dashboard/tax-harvesting" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-background hover:brightness-110 transition-colors border border-amber/20 bg-amber px-3 py-1.5 rounded-[2px] font-semibold shadow-glow-amber"
            >
              <Lock className="w-3 h-3" />
              Tax Harvesting
            </Link>
            <span className="text-xs text-muted-foreground font-body hidden sm:block">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="pt-24 max-w-4xl mx-auto px-6 relative">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2 flex items-center gap-3">
            Tax Scenario Analysis
            {!isPro && <Lock className="w-5 h-5 text-amber/80" />}
          </h1>
          <p className="text-muted-foreground font-body text-sm max-w-2xl">
            Explore hypothetical tax scenarios based on your current holdings. For educational purposes only — not tax or investment advice.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-surface-border mb-8">
          <button
            onClick={() => setActiveTab("LOSS_HARVESTING")}
            className={`px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === "LOSS_HARVESTING" ? "text-amber" : "text-muted-foreground hover:text-foreground"}`}
          >
            Loss Scenario
            {activeTab === "LOSS_HARVESTING" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("LTCG_OPTIMISER")}
            className={`px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === "LTCG_OPTIMISER" ? "text-amber" : "text-muted-foreground hover:text-foreground"}`}
          >
            LTCG Scenario
            {activeTab === "LTCG_OPTIMISER" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
            )}
          </button>
        </div>

        {/* Content wrapper with Paywall Overlay */}
        <div className="relative">
          {/* Content (will be blurred/covered if !isPro) */}
          <div className={`${!isPro ? "filter blur-md pointer-events-none opacity-40 select-none" : ""}`}>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === "LOSS_HARVESTING" && (
                  <div className="space-y-6">
                    {/* FY Timeline Info */}
                    <div className={`p-4 rounded-[2px] border flex items-start gap-3 ${daysToMarch31 < 30 ? "bg-drift-red/10 border-drift-red/20 text-drift-red" : "bg-amber/5 border-amber/20 text-amber"}`}>
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-sm tracking-tight font-medium uppercase">
                          {daysToMarch31} days remaining in this financial year (ending 31 March)
                        </p>
                        <p className="text-xs opacity-80 mt-1 font-body">
                          Tax loss harvesting scenarios are typically evaluated before the financial year ends.
                        </p>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-card border border-surface-border rounded-[2px]">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Unrealized gains</p>
                        <p className="font-mono text-lg text-foreground">₹{totalUnrealizedGains.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Unrealized losses</p>
                        <p className="font-mono text-lg text-drift-red">
                          {totalHarvestableLosses < 0 && "-"}₹{Math.abs(totalHarvestableLosses).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Net if offset</p>
                        <p className="font-mono text-lg text-foreground">
                          ₹{Math.max(0, totalUnrealizedGains + totalHarvestableLosses).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="pl-4 border-l border-surface-border">
                        <p className="text-[10px] text-amber uppercase font-mono tracking-wider mb-1 font-semibold">Hypothetical Impact</p>
                        <p className="font-mono text-2xl text-amber font-bold">
                          ₹{(Math.abs(totalHarvestableLosses) * 0.20).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[9px] text-muted-foreground/50 font-body mt-1">Estimated · not guaranteed</p>
                      </div>
                    </div>

                    {/* Scenarios list */}
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4">Loss Positions — Scenario Analysis</h3>
                    {lossSuggestions.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-surface-border bg-surface/20">
                        <p className="font-mono text-sm text-foreground mb-2">No loss positions found</p>
                        <p className="text-xs text-muted-foreground font-body">Your positions are currently in profit or have no recorded losses.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lossSuggestions.map(h => (
                          <div key={h.id} className="p-5 border border-surface-border bg-card rounded-[2px] hover:border-surface-border/80 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] font-mono tracking-widest uppercase bg-amber/10 text-amber px-2 py-1 rounded-[2px] border border-amber/20 mb-3 inline-block">
                                  Hypothetical Scenario
                                </span>
                                <h4 className="font-mono text-lg font-medium text-foreground">{h.symbol}</h4>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground font-mono mb-1 tracking-wider">Unrealized Loss</p>
                                <p className="font-mono text-drift-red">-₹{Math.abs(h.pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                              </div>
                            </div>

                            <div className="bg-surface/40 p-3 rounded-[2px] border border-surface-border/50 text-sm font-body">
                              <p className="text-foreground/90 mb-1">
                                <strong>If</strong> this loss were realized, it could hypothetically offset <strong>₹{Math.abs(h.pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong> of gains.
                              </p>
                              <p className="text-amber font-medium">
                                Estimated tax impact: ₹{h.estimatedImpact.toLocaleString("en-IN", { maximumFractionDigits: 0 })} <span className="opacity-70 font-normal text-xs">(hypothetical · at 20% STCG rate)</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "LTCG_OPTIMISER" && (
                  <div className="space-y-6">
                    {/* Exemption Meter */}
                    <div className="p-6 bg-card border border-surface-border rounded-[2px]">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">LTCG Exemption Limit (per FY)</p>
                          <p className="font-mono text-xl text-foreground">₹{LTCG_EXEMPTION_LIMIT.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-amber uppercase font-mono tracking-wider mb-1 font-semibold">Potentially available</p>
                          <p className="font-mono text-xl text-amber">₹{exemptionRemaining.toLocaleString("en-IN")}</p>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-surface rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-drift-green"
                          style={{ width: `${(ltcgUsedThisFy / LTCG_EXEMPTION_LIMIT) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono text-right">
                        ₹{ltcgUsedThisFy.toLocaleString("en-IN")} used • Assumes no LTCG booked this FY (verify independently)
                      </p>
                    </div>

                    {/* Summary */}
                    {ltcgSuggestions.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 p-5 bg-surface/20 border border-amber/10 rounded-[2px]">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Hypothetical LTCG within exemption</p>
                          <p className="font-mono text-lg text-foreground">₹{ltcgUsedInSuggestions.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="border-l border-surface-border/50 pl-4">
                          <p className="text-[10px] text-amber uppercase font-mono tracking-wider mb-1 font-semibold">Estimated tax impact</p>
                          <p className="font-mono text-lg text-amber">₹{ltcgEstimatedImpact.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                          <p className="text-[9px] text-muted-foreground/50 font-body mt-1">Hypothetical · verify with a CA</p>
                        </div>
                      </div>
                    )}

                    {/* Scenarios list */}
                    <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-8 mb-4">LTCG Exemption — Scenario Analysis</h3>
                    {ltcgSuggestions.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-surface-border bg-surface/20">
                        <p className="font-mono text-sm text-foreground mb-2">No LTCG scenarios found</p>
                        <p className="text-xs text-muted-foreground font-body">You do not have any positions held for {'>'} 365 days that are currently in profit, or your purchase dates are not recorded.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ltcgSuggestions.map(h => (
                          <div key={h.id} className="p-5 border border-surface-border bg-card rounded-[2px] hover:border-surface-border/80 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] font-mono tracking-widest uppercase bg-amber/10 text-amber px-2 py-1 rounded-[2px] border border-amber/20 mb-3 inline-block">
                                  Hypothetical Scenario
                                </span>
                                <h4 className="font-mono text-lg font-medium text-foreground">{h.symbol}</h4>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground font-mono mb-1 tracking-wider">Holding Period</p>
                                <p className="font-mono text-foreground">{h.holdingPeriodYrs} years</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-surface/40 p-4 rounded-[2px] border border-surface-border/50 mb-4">
                              <div>
                                <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Unrealized Gain</p>
                                <p className="font-mono text-sm font-medium text-drift-green">₹{h.pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1">If realized within exemption</p>
                                <p className="font-mono text-sm font-medium text-foreground">₹0 tax <span className="opacity-50 text-xs font-normal">(hypothetical)</span></p>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm font-body">
                              <p className="text-foreground/90 flex items-center gap-2">
                                <span className="text-amber">→</span> Current avg. cost: <strong className="font-mono">₹{h.avgBuyPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                              </p>
                              <p className="text-foreground/90 flex items-center gap-2">
                                <span className="text-amber">→</span> Current market price: <strong className="font-mono">₹{h.currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                              </p>
                              <p className="text-amber font-medium flex items-center gap-2">
                                <span className="text-amber">→</span> Estimated tax impact: <strong className="font-mono">₹{h.estimatedImpact.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong>
                                <span className="opacity-70 text-xs font-normal">(hypothetical)</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Educational Info & Disclaimers */}
            <div className="mt-12 space-y-4 border-t border-surface-border pt-8">
              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Educational Overview
                  </div>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="mt-4 text-xs font-body text-muted-foreground space-y-3 leading-relaxed">
                  <p><strong>What is Tax Loss Harvesting?</strong> A strategy where unrealized losses in a portfolio are used to offset realized gains for tax purposes. This is a well-known concept in personal finance education. The applicability and benefit depends on individual circumstances.</p>
                  <p><strong>What is the LTCG Exemption?</strong> Under current Indian tax law, up to ₹1,25,000 in Long Term Capital Gains (LTCG) per financial year may be exempt from tax. This threshold and the applicable rules are subject to change. Always verify the current law with a qualified CA.</p>
                </div>
              </details>

              <div className="text-[10px] font-body text-muted-foreground/60 leading-relaxed max-w-3xl p-4 border border-surface-border/30 bg-surface/10 rounded-[2px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 block mb-2">Important Disclaimer</span>
                Ratio x is not a SEBI-registered investment advisor, research analyst, or portfolio manager. 
                All scenarios, calculations, and analyses shown are <strong>hypothetical and for educational purposes only</strong>. 
                This is not tax advice, investment advice, or a recommendation to buy, sell, or hold any security. 
                Tax laws change frequently and calculations may not reflect current regulations. 
                Consult a SEBI-registered investment advisor and qualified Chartered Accountant before making any financial or tax decisions. 
                Users assume full responsibility for their own financial decisions.
              </div>
            </div>
          </div>

          {/* Paywall Overlay */}
          {!isPro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
              <div className="bg-card border border-surface-border rounded-[2px] p-8 max-w-[400px] w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber/40 via-amber to-amber/40" />

                <div className="w-12 h-12 bg-surface border border-surface-border rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-5 h-5 text-amber" />
                </div>

                <p className="text-[10px] uppercase font-mono tracking-widest text-amber mb-2 font-semibold">Pro Feature</p>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Tax Scenario Analysis</h2>
                <p className="text-sm font-body text-muted-foreground mb-8">
                  Explore hypothetical tax scenarios based on your portfolio data — for educational purposes only.
                </p>

                <div className="text-left space-y-3 mb-8">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">What you get:</p>
                  {[
                    "Loss position scenario analysis",
                    "LTCG exemption scenario modeling",
                    "Hypothetical tax impact estimates",
                    "Educational portfolio insights"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-body text-foreground">
                      <div className="w-1 h-1 bg-amber rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleUpgradeIntent}
                    className="w-full bg-amber text-background font-mono text-xs uppercase tracking-widest font-semibold py-3.5 rounded-[2px] hover:brightness-110 transition-all shadow-glow-amber flex items-center justify-center gap-2"
                  >
                    Upgrade to Pro — ₹199/month
                  </button>
                  <Link
                    to="/dashboard"
                    className="block w-full text-center py-2 text-xs font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                  >
                    Maybe later
                  </Link>
                </div>

                <p className="text-[9px] text-muted-foreground/40 font-body mt-6">
                  Not investment or tax advice. Educational tool only.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Disclaimer */}
      <Disclaimer />
    </div>
  );
};

export default TaxHarvesting;
