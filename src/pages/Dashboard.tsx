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
import DashboardNav from "@/components/DashboardNav";
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
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0]">
      {/* Universal Institutional Navigation */}
      <DashboardNav activeTab="drift" />

      {/* Main Content */}
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6 relative">
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
            {/* Portfolio Overview Card */}
            <div className="mb-10 p-6 md:p-8 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a] relative overflow-hidden">
              
              {/* Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1a1a1a] mb-6 relative z-10">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                    {portfolio?.name || "My Portfolio"}
                  </h1>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="text-[13px] font-medium bg-amber text-black px-4 py-2 rounded-md hover:brightness-110 transition-all"
                  >
                    + Add position
                  </button>
                  <button
                    onClick={() => setImportCSVModalOpen(true)}
                    className="text-[13px] font-medium border border-[#2a2a2a] bg-[#141414] text-white hover:bg-[#1e1e1e] px-4 py-2 rounded-md transition-all"
                  >
                    Import CAS
                  </button>
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="text-[13px] font-medium border border-[#2a2a2a] bg-[#141414] text-[#aaa] hover:text-white hover:bg-[#1e1e1e] px-3 py-2 rounded-md transition-all flex items-center gap-1.5"
                    title="Export Tear Sheet"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber" />
                    <span>Tear sheet</span>
                  </button>
                </div>
              </div>

              {/* Metrics & Health Score Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
                {/* 3 Metrics Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Value */}
                  <div className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] p-5 rounded-lg transition-all group">
                    <p className="text-[11px] text-[#777] font-medium uppercase tracking-wide mb-2">
                      Total value
                    </p>
                    <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight tabular group-hover:text-amber transition-colors">
                      ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  {/* Invested */}
                  <div className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] p-5 rounded-lg transition-all">
                    <p className="text-[11px] text-[#777] font-medium uppercase tracking-wide mb-2">
                      Total invested
                    </p>
                    <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight tabular">
                      ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  {/* P&L */}
                  <div className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] p-5 rounded-lg transition-all">
                    <p className="text-[11px] text-[#777] font-medium uppercase tracking-wide mb-2">
                      Overall P&L
                    </p>
                    <p className={`font-mono text-2xl md:text-3xl font-medium tracking-tight tabular ${overallPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {overallPnl >= 0 ? "+" : "-"}₹{Math.abs(overallPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    <p className={`text-[12px] font-mono mt-1.5 ${overallPnl >= 0 ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                      {overallPnlPct >= 0 ? "+" : ""}{overallPnlPct.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Health Score Gauge Tile */}
                <div className="lg:col-span-4 bg-[#0f0f0f] border border-[#1a1a1a] p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#777] font-medium uppercase tracking-wide">
                      Health score
                    </span>
                    <button 
                      onClick={async () => {
                        clearPriceCache();
                        toast.loading("Syncing prices...", { id: "refresh-toast" });
                        await refreshDriftData();
                        toast.success("Prices updated successfully", { id: "refresh-toast" });
                      }}
                      className="text-[#666] hover:text-amber transition-colors p-1"
                      title="Refresh market data"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative my-2 flex items-center justify-center">
                    <svg width="140" height="76" viewBox="0 0 120 68">
                      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#1f1f1f" strokeWidth="7" strokeLinecap="round" />
                      <path 
                        d="M10 60 A50 50 0 0 1 110 60" 
                        fill="none" 
                        stroke={healthScore < 50 ? "#f43f5e" : healthScore < 75 ? "#f59e0b" : "#10b981"} 
                        strokeWidth="7" 
                        strokeLinecap="round"
                        strokeDasharray="157" 
                        strokeDashoffset={157 - 157 * (healthScore / 100)} 
                        className="transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <div className="absolute bottom-0 text-center">
                      <span className="text-3xl font-bold text-white tracking-tight tabular">
                        {healthScore.toFixed(0)}
                      </span>
                      <span className="text-xs text-[#666] ml-0.5">/100</span>
                    </div>
                  </div>

                  <p className={`text-[12px] mt-2 font-medium ${
                    healthScore < 50 ? "text-rose-400" : healthScore < 75 ? "text-amber" : "text-emerald-400"
                  }`}>
                    {healthScore < 50 ? "Critical" : healthScore < 75 ? "Moderate" : "Healthy"}
                  </p>
                  
                  <p className="text-[11px] text-[#555] mt-1">
                    {lastUpdated ? (minsAgo === 0 ? "Updated just now" : `${minsAgo}m ago`) : "Live"}
                  </p>
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
