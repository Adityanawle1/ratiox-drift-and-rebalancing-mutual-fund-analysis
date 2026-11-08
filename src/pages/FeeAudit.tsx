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
import DashboardNav from "@/components/DashboardNav";

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
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] pb-20">
      <DashboardNav activeTab="fee-audit" />

      <div className="pt-28 max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 border-b border-[#1a1a1a] pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
              Fee Audit
            </h1>
            <p className="text-[#888] text-sm max-w-2xl leading-relaxed">
              See every rupee you are paying — visible and hidden. Across your entire portfolio.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setAddModalOpen(true)}
              className="text-[13px] font-medium bg-amber text-black px-5 py-2.5 rounded-md hover:brightness-110 transition-all"
            >
              + Add mutual fund
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b border-[#1a1a1a] mb-8 overflow-x-auto pb-px">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-[13px] font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.key 
                  ? "text-amber" 
                  : "text-[#777] hover:text-white"
              }`}>
              {tab.label}
              {activeTab === tab.key && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-amber" />}
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

            {/* Disclaimer */}
            <div className="mt-12 text-[11px] text-[#666] leading-relaxed max-w-3xl p-4 border border-[#1a1a1a] rounded-md">
              <span className="text-[10px] font-medium text-[#888] block mb-1.5">Disclaimer</span>
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
