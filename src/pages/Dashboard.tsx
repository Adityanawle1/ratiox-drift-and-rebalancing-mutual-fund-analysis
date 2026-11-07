import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getHoldings, getAssetTargets, getUserPortfolios, createPortfolio, deleteHolding, getUserProfile, getRebalanceLogs } from "@/api/portfolio";
import { calculateDrift, calculateHealthScore, HoldingWithValue, AssetClass, enrichHoldingsWithMarketData, DriftResult } from "@/lib/drift-engine";
import { refreshPrices, clearPriceCache } from "@/lib/market-data";
import { supabase, type Database } from "@/lib/supabase";

type PortfolioRow = Database['public']['Tables']['portfolios']['Row'];
type HoldingRow = Database['public']['Tables']['holdings']['Row'];
import AddHoldingModal from "@/components/AddHoldingModal";
import EditHoldingModal from "@/components/EditHoldingModal";
import ImportCSVModal from "@/components/ImportCSVModal";
import RebalanceModal from "@/components/RebalanceModal";
import SharePortfolioModal from "@/components/SharePortfolioModal";
import DriftTable from "@/components/DriftTable";
import HoldingsLedger from "@/components/HoldingsLedger";
import RebalanceHistory from "@/components/RebalanceHistory";
import { format } from "date-fns";
import { Share2, Lock } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import { toast } from "sonner";

const statusColor = { healthy: "text-drift-green", drifting: "text-amber", critical: "text-drift-red" };
const statusBg = { healthy: "bg-drift-green", drifting: "bg-amber", critical: "bg-drift-red" };
const statusLabel = { healthy: "On Target", drifting: "Drifting", critical: "Critical" };

/**
 * Dashboard Component
 * The main application interface for authenticated users.
 * Handles portfolio visualization, live market data polling, and drift calculations.
 */
const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolio, setPortfolio] = useState<PortfolioRow | null>(null);
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [holdingsWithValues, setHoldingsWithValues] = useState<HoldingWithValue[]>([]);
  const [assetTargets, setAssetTargets] = useState<AssetClass[]>([]);
  const [driftResults, setDriftResults] = useState<DriftResult[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [overallPnl, setOverallPnl] = useState(0);
  const [overallPnlPct, setOverallPnlPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importCSVModalOpen, setImportCSVModalOpen] = useState(false);
  const [rebalanceModalOpen, setRebalanceModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [minsAgo, setMinsAgo] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingHolding, setEditingHolding] = useState<HoldingRow | null>(null);
  const [failedPriceSymbols, setFailedPriceSymbols] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rebalanceLogs, setRebalanceLogs] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculatePortfolioMetrics = useCallback(async (rawHoldings: HoldingRow[], targets: AssetClass[]) => {
    // Fetch live prices with proper error handling
    const { prices, failedSymbols } = await refreshPrices(rawHoldings);
    setFailedPriceSymbols(failedSymbols || []);

    // Enrich holdings with market data, PnL, tax status, CAGR
    const enrichedHoldings = enrichHoldingsWithMarketData(rawHoldings, prices);
    setHoldingsWithValues(enrichedHoldings);

    // Calculate total portfolio value using market values
    const total = enrichedHoldings.reduce((s, h) => s + h.marketValue, 0);
    setTotalValue(total);

    const invested = enrichedHoldings.reduce((s, h) => s + h.costBasis, 0);
    setTotalInvested(invested);

    const pnl = total - invested;
    setOverallPnl(pnl);

    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    setOverallPnlPct(pnlPct);

    // Calculate drift using corrected logic
    const drift = calculateDrift(enrichedHoldings, targets);
    setDriftResults(drift);

    // Calculate health score using corrected formula
    setHealthScore(calculateHealthScore(drift));

    const now = new Date();
    setLastUpdated(now);
    setMinsAgo(0);
  }, []);

  // Lightweight price-only refresh (no full reload, no loading spinner)
  const refreshDriftData = useCallback(async () => {
    if (!portfolio || holdings.length === 0) return;
    await calculatePortfolioMetrics(holdings, assetTargets);
  }, [portfolio, holdings, assetTargets, calculatePortfolioMetrics]);

  const initDashboard = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setFetchError(null);

      // Check if user needs risk profile setup - be lenient about missing risk_profile column
      const { data: profile } = await getUserProfile(user.id);
      
      // Only redirect to onboarding if explicitly not onboarded (ignore missing risk_profile for now)
      if (profile && (profile as { onboarded?: boolean }).onboarded === false) { 
        navigate("/onboarding"); 
        return; 
      }
      
      // If profile doesn't exist or onboarded is null/undefined, assume they can proceed
      // This handles the case where the database schema is incomplete

      const { data: portfolios, error: portError } = await getUserPortfolios(user.id);
      if (portError) throw portError;

      let p = portfolios?.[0] as PortfolioRow | undefined;
      if (!p) {
        const { data: newP, error: createError } = await createPortfolio(user.id, "My Portfolio");
        if (createError) throw createError;
        p = newP as PortfolioRow;
      }
      setPortfolio(p || null);

      if (p) {
        const [{ data: h, error: hError }, { data: t, error: tError }] = await Promise.all([
          getHoldings(p.id),
          getAssetTargets(p.id),
        ]);

        if (hError) throw hError;
        if (tError) throw tError;

        const { data: logs } = await getRebalanceLogs(p.id);
        setRebalanceLogs(logs || []);

        const loadedHoldings = h || [];
        const loadedTargets = t || [];
        setHoldings(loadedHoldings);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targets: AssetClass[] = loadedTargets.map((t: any) => ({
          name: t.asset_class, 
          targetPct: Number(t.target_pct), 
          driftThreshold: Number(t.drift_threshold || 5.0),
        }));
        setAssetTargets(targets);

        if (loadedHoldings.length > 0 && loadedTargets.length > 0) {
          await calculatePortfolioMetrics(loadedHoldings, targets);
        }
      }
    } catch (err: unknown) {
      console.error("Dashboard initialization failed:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load portfolio data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, navigate, calculatePortfolioMetrics]);

  useEffect(() => {
    if (!user) return;
    
    initDashboard();

    // Setup intervals
    const refreshInterval = setInterval(() => {
      // Use the latest stability of metrics if possible, but keep simple for now
      refreshDriftData();
    }, 15 * 60 * 1000);

    const tickInterval = setInterval(() => {
      setLastUpdated((prev) => { 
        if (prev) setMinsAgo(Math.floor((Date.now() - prev.getTime()) / 60000)); 
        return prev; 
      });
    }, 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
    // Only re-run when user ID changes to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, initDashboard]); // refreshDriftData removed from deps to prevent infinite loop

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("rebalance") === "true") {
      setRebalanceModalOpen(true);
      // Clean up search query parameter
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, navigate]);

  const handleDeleteHolding = async (id: string) => {
    setDeletingId(id);
    await deleteHolding(id);
    setDeletingId(null);
    initDashboard();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-premium border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold gradient-text-amber hover:brightness-125 transition-all text-premium">Ratio x</Link>
          <div className="flex items-center gap-6">
            <Link 
              to="/learn-drift" 
              className="hidden md:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-amber transition-colors"
            >
              How It Works
            </Link>
            <Link 
              to="/dashboard/fee-audit" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber/80 hover:text-amber transition-premium border border-amber/20 bg-amber/5 px-3 py-1.5 rounded-[4px] hover:bg-amber/10 hover:border-amber/40 hover:shadow-glow-amber"
            >
              Fee Audit
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-background hover:brightness-110 transition-premium border border-amber/20 bg-amber px-4 py-1.5 rounded-[4px] font-semibold shadow-glow-amber"
            >
              Drift Engine
            </Link>

            <Link 
              to="/dashboard/tax-harvesting" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber/80 hover:text-amber transition-premium border border-amber/20 bg-amber/5 px-3 py-1.5 rounded-[4px] hover:bg-amber/10 hover:border-amber/40 hover:shadow-glow-amber"
            >
              <Lock className="w-3 h-3" />
              Tax Harvesting
            </Link>
            <span className="text-xs text-muted-foreground font-body hidden sm:block text-premium">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors text-premium"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-body animate-pulse">Loading portfolio...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-sm text-drift-red font-body mb-4">{fetchError}</p>
            <button 
              onClick={() => initDashboard()}
              className="text-xs bg-surface-border hover:bg-surface text-foreground font-body px-4 py-2 rounded-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div className="flex flex-col md:flex-row items-start justify-between mb-12 p-8 rounded-[12px] bg-card/40 border border-surface-border/50 glass shadow-premium card-hover-glow relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 w-full md:w-auto">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground heading-premium mb-2">
                  {portfolio?.name || "My Portfolio"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6">
                  <div className="group">
                    <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1.5">Total Value</p>
                    <p className="font-mono text-2xl md:text-3xl text-foreground text-premium group-hover:text-amber transition-colors duration-300">
                      ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1.5">Total Invested</p>
                    <p className="font-mono text-2xl md:text-3xl text-foreground text-premium transition-colors duration-300">
                      ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1.5">Overall P&L</p>
                    <p className={`font-mono text-2xl md:text-3xl text-premium ${overallPnl >= 0 ? "text-drift-green" : "text-drift-red"}`}>
                      {overallPnl >= 0 ? "+" : "-"}₹{Math.abs(overallPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      <span className="text-sm md:text-base ml-2 opacity-70 font-medium">
                        ({overallPnlPct >= 0 ? "+" : ""}{overallPnlPct.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="text-right mt-8 md:mt-0 relative z-10 flex flex-col items-end shrink-0">
                <div className="font-mono text-5xl font-bold gradient-text-amber glow-text">
                  {healthScore.toFixed(0)}
                  <span className="text-lg text-amber/40 font-medium ml-1">/100</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mt-2">Health Score</p>
                <div className="relative mt-3">
                  <svg width="120" height="68" viewBox="0 0 120 68" className="drop-shadow-lg">
                    <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="hsl(0 0% 13%)" strokeWidth="6" strokeLinecap="round" />
                    <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="hsl(37 90% 55%)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray="157" strokeDashoffset={157 - 157 * (healthScore / 100)} 
                      className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 bg-amber/20 blur-xl rounded-full opacity-40 mix-blend-screen pointer-events-none" />
                </div>
                <div className="flex items-center justify-end gap-3 mt-3">
                  {lastUpdated && (
                    <p className="text-[10px] text-muted-foreground font-body">
                      {minsAgo === 0 ? "Updated just now" : `Updated ${minsAgo}m ago`}
                    </p>
                  )}
                  <button 
                    onClick={async () => {
                      clearPriceCache();
                      toast.loading("Refreshing prices...", { id: "refresh-toast" });
                      await refreshDriftData();
                      toast.success("Prices updated successfully", { id: "refresh-toast" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-white/5"
                    title="Force refresh live prices"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                </div>
                {failedPriceSymbols.length > 0 && (
                  <p className="text-[10px] text-drift-red font-body mt-1">
                    {failedPriceSymbols.length} price(s) unavailable
                  </p>
                )}

                <div className="flex flex-col items-end mt-6">
                  <button 
                    onClick={() => setShareModalOpen(true)}
                    className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-muted-foreground hover:text-foreground transition-all bg-surface-border/30 hover:bg-surface-border/60 border border-surface-border px-3 py-1.5 rounded"
                  >
                    <Share2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:text-amber transition-colors" />
                    Export Tear Sheet
                  </button>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1 inset-y-0 h-1 rounded-full bg-drift-green/60"></span>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-mono">
                      Data Anonymized
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drift Table */}
            <DriftTable 
              driftResults={driftResults} 
              setRebalanceModalOpen={setRebalanceModalOpen}
              setAddModalOpen={setAddModalOpen}
              setImportCSVModalOpen={setImportCSVModalOpen}
            />

            {/* Holdings list */}
            <HoldingsLedger
              holdingsWithValues={holdingsWithValues}
              holdings={holdings}
              setEditingHolding={setEditingHolding}
              handleDeleteHolding={handleDeleteHolding}
              deletingId={deletingId}
              setImportCSVModalOpen={setImportCSVModalOpen}
              setAddModalOpen={setAddModalOpen}
            />
            {/* Rebalance History */}
            <RebalanceHistory rebalanceLogs={rebalanceLogs} />
          </>
        )}
      </div>

      {/* Legal Disclaimer */}
      <Disclaimer />

      {/* Modals */}
      {portfolio && (
        <>
          <AddHoldingModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            portfolioId={portfolio.id}
            userId={user!.id}
            assetClasses={assetTargets.map(t => t.name)}
            onSuccess={initDashboard}
          />
          <EditHoldingModal
            open={!!editingHolding}
            onOpenChange={(open) => !open && setEditingHolding(null)}
            holding={editingHolding}
            onSuccess={() => {
              setEditingHolding(null);
              initDashboard();
            }}
          />
          <ImportCSVModal
            open={importCSVModalOpen}
            onOpenChange={setImportCSVModalOpen}
            portfolioId={portfolio.id}
            userId={user!.id}
            assetClasses={assetTargets.map(t => t.name)}
            onSuccess={initDashboard}
          />
          <RebalanceModal
            open={rebalanceModalOpen}
            onOpenChange={setRebalanceModalOpen}
            portfolioId={portfolio.id}
            userId={user!.id}
            holdings={holdingsWithValues}
            targets={assetTargets}
            onSuccess={initDashboard}
          />
          <SharePortfolioModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            data={{
              healthScore,
              totalValue,
              totalInvested,
              pnl: overallPnl,
              pnlPct: overallPnlPct,
              holdingsCount: holdings.length,
              lastRebalanced: rebalanceLogs.length > 0 ? rebalanceLogs[0].date : null,
              driftResults,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
