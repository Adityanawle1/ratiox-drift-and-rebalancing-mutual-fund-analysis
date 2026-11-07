import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserPortfolios, getHoldings, getAssetTargets } from "@/api/portfolio";
import { refreshPrices } from "@/lib/market-data";
import { enrichHoldingsWithMarketData, HoldingWithValue, AssetClass } from "@/lib/drift-engine";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import Disclaimer from "@/components/Disclaimer";
import PortfolioFeeOverview from "@/components/fee-audit/PortfolioFeeOverview";
import RegularVsDirectTab from "@/components/fee-audit/RegularVsDirectTab";
import CostProjectorTab from "@/components/fee-audit/CostProjectorTab";
import ExitLoadMonitor from "@/components/fee-audit/ExitLoadMonitor";
import HiddenChargesTab from "@/components/fee-audit/HiddenChargesTab";
import AddHoldingModal from "@/components/AddHoldingModal";

type Tab = "OVERVIEW" | "REGULAR_VS_DIRECT" | "COST_PROJECTOR" | "EXIT_LOAD" | "HIDDEN_CHARGES";

const TABS: { key: Tab; label: string }[] = [
  { key: "OVERVIEW", label: "Fee Overview" },
  { key: "REGULAR_VS_DIRECT", label: "Regular vs Direct" },
  { key: "COST_PROJECTOR", label: "Cost Projector" },
  { key: "EXIT_LOAD", label: "Exit Load" },
  { key: "HIDDEN_CHARGES", label: "Hidden Charges" },
];

const FeeAudit = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPro] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [assetTargets, setAssetTargets] = useState<AssetClass[]>([]);

  // Per-holding metadata (stored client-side for now, would persist to DB columns)
  const [terMap, setTerMap] = useState<Record<string, number>>({});
  const [planTypeMap, setPlanTypeMap] = useState<Record<string, string>>({});
  const [sipMap, setSipMap] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: portfolios } = await getUserPortfolios(user.id);
      if (portfolios && portfolios.length > 0) {
        const pid = portfolios[0].id;
        setPortfolioId(pid);
        const [{ data: rawHoldings }, { data: targets }] = await Promise.all([
          getHoldings(pid),
          getAssetTargets(pid),
        ]);
        if (rawHoldings) {
          const { prices } = await refreshPrices(rawHoldings);
          const enriched = enrichHoldingsWithMarketData(rawHoldings, prices);
          setHoldings(enriched || []);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedTargets: AssetClass[] = (targets || []).map((t: any) => ({
            name: String(t.asset_class),
            targetPct: Number(t.target_pct),
            driftThreshold: Number(t.drift_threshold || 5.0),
          }));
          setAssetTargets(mappedTargets);

          // Load TER, plan_type, monthly_sip from enriched holdings (typed fields)
          const newTerMap: Record<string, number> = {};
          const newPlanMap: Record<string, string> = {};
          const newSipMap: Record<string, number> = {};
          for (const h of enriched) {
            if (h.ter && h.ter > 0) newTerMap[h.id] = h.ter;
            if (h.planType) newPlanMap[h.id] = h.planType;
            if (h.monthlySip && h.monthlySip > 0) newSipMap[h.id] = h.monthlySip;
          }
          setTerMap(prev => ({ ...prev, ...newTerMap }));
          setPlanTypeMap(prev => ({ ...prev, ...newPlanMap }));
          setSipMap(prev => ({ ...prev, ...newSipMap }));
        }
      }
    } catch (err) {
      console.error("Failed to load fee audit data", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpgradeIntent = async () => {
    toast.info("Pro launching soon. You're on the early access list.");
    if (user) {
      await supabase.from("upgrade_intents").insert({
        user_id: user.id,
        feature: "fee_audit",
      });
    }
  };

  // Filter to MF-like holdings for fee audit
  const mfHoldings = holdings.filter(h => {
    if (h.instrumentType) {
      const type = h.instrumentType.toLowerCase();
      return type === 'mf' || type === 'mutual_fund' || type === 'etf';
    }
    // Fallback for older data without instrument_type
    const ac = h.assetClass.toLowerCase();
    return ac.includes("fund") || ac.includes("etf") || ac.includes("mf") ||
           ac.includes("debt") || ac.includes("elss") || ac.includes("index") ||
           ac.includes("hybrid") || ac.includes("balanced");
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-premium border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold gradient-text-amber hover:brightness-125 transition-all text-premium">Ratio x</Link>
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard/fee-audit" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-background hover:brightness-110 transition-premium border border-amber/20 bg-amber px-4 py-1.5 rounded-[4px] font-semibold shadow-glow-amber"
            >
              Fee Audit
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber/80 hover:text-amber transition-premium border border-amber/20 bg-amber/5 px-3 py-1.5 rounded-[4px] hover:bg-amber/10 hover:border-amber/40 hover:shadow-glow-amber"
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
            <button onClick={() => { signOut(); navigate("/"); }} className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors text-premium">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="pt-32 max-w-4xl mx-auto px-6 relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3 flex items-center gap-3 heading-premium">
              Fee Audit
            </h1>
            <p className="text-muted-foreground font-body text-base max-w-2xl text-premium subheading-premium">
              See every rupee you are paying — visible and hidden. Across your entire portfolio.
            </p>
          </div>
          <div>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="text-[11px] uppercase tracking-wider border border-amber/30 bg-amber/90 text-background font-mono px-5 py-3 rounded-[4px] font-bold hover:brightness-110 hover:bg-amber hover-lift transition-all shadow-glow-amber shrink-0"
            >
              Add Mutual Fund
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-surface-border mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-3 font-mono text-[10px] uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab.key ? "text-amber" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative">
          <div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === "OVERVIEW" && <PortfolioFeeOverview holdings={mfHoldings} terMap={terMap} />}
                {activeTab === "REGULAR_VS_DIRECT" && <RegularVsDirectTab holdings={mfHoldings} terMap={terMap} planTypeMap={planTypeMap} />}
                {activeTab === "COST_PROJECTOR" && <CostProjectorTab holdings={mfHoldings} terMap={terMap} />}
                {activeTab === "EXIT_LOAD" && <ExitLoadMonitor holdings={mfHoldings} />}
                {activeTab === "HIDDEN_CHARGES" && <HiddenChargesTab holdings={mfHoldings} terMap={terMap} planTypeMap={planTypeMap} sipMap={sipMap} />}
              </>
            )}

            {/* Per-tab disclaimer */}
            <div className="mt-12 text-[10px] font-body text-muted-foreground/60 leading-relaxed max-w-3xl p-4 border border-surface-border/30 bg-surface/10 rounded-[2px]">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 block mb-2">Disclaimer</span>
              Ratio x uses publicly available fee structures and your entered data to estimate costs. Actual charges may vary.
              Stamp duty, STT, and exit load rules may change. This is not financial advice. Always verify with your fund house or AMFI.
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />

      {portfolioId && (
        <AddHoldingModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          portfolioId={portfolioId}
          userId={user!.id}
          assetClasses={assetTargets.length > 0 ? assetTargets.map(t => t.name) : ["Large Cap Equity", "Mid Cap Equity", "Small Cap Equity", "Debt", "Gold", "Hybrid", "Index", "Liquid"]}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default FeeAudit;
