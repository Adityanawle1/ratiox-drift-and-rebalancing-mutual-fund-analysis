import { useState, useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { estimateDirectTer, computeCorpus, formatINR } from "@/lib/fee-calculator";

interface Props {
  holdings: HoldingWithValue[];
  terMap: Record<string, number>;
  planTypeMap: Record<string, string>;
}

const RegularVsDirectTab = ({ holdings, terMap, planTypeMap }: Props) => {
  const [showExplainer, setShowExplainer] = useState(false);

  const regularFunds = holdings.filter(h => {
    const plan = planTypeMap[h.id] || "unknown";
    return plan === "regular" || plan === "unknown";
  }).filter(h => terMap[h.id] !== undefined && terMap[h.id] > 0);

  const portfolioTotal = useMemo(() => {
    let totalSavings = 0;
    for (const h of regularFunds) {
      const ter = terMap[h.id];
      const directTer = estimateDirectTer(ter);
      const grossReturn = 0.12;
      const regularCorpus = computeCorpus(h.marketValue / 120, grossReturn - ter / 100, 10);
      const directCorpus = computeCorpus(h.marketValue / 120, grossReturn - directTer / 100, 10);
      totalSavings += directCorpus - regularCorpus;
    }
    return totalSavings;
  }, [regularFunds, terMap]);

  return (
    <div className="space-y-6">
      {regularFunds.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-surface-border bg-surface/20 rounded-[2px]">
          <p className="font-mono text-sm text-foreground mb-2">No regular plan funds found</p>
          <p className="text-xs text-muted-foreground font-body">Add TER and plan type to your mutual fund holdings to see comparison.</p>
        </div>
      ) : (
        <>
          {regularFunds.map(h => {
            const ter = terMap[h.id];
            const directTer = estimateDirectTer(ter);
            const annualSaving = (h.marketValue * (ter - directTer)) / 100;
            const grossReturn = 0.12;
            const monthlySIP = h.marketValue / 120;
            const regularCorpus = computeCorpus(monthlySIP, grossReturn - ter / 100, 10);
            const directCorpus = computeCorpus(monthlySIP, grossReturn - directTer / 100, 10);
            const savings = directCorpus - regularCorpus;
            const monthsOfSIP = monthlySIP > 0 ? Math.round(savings / monthlySIP) : 0;

            return (
              <div key={h.id} className="p-5 border border-surface-border bg-card rounded-[2px]">
                <h4 className="font-mono text-base font-medium text-foreground mb-4">
                  {h.name} <span className="text-muted-foreground text-xs">({planTypeMap[h.id] === "unknown" ? "Assumed Regular" : "Regular"})</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono mb-4">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Your TER</p>
                    <p className="text-foreground">{ter.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Direct Plan TER</p>
                    <p className="text-drift-green">{directTer.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Annual Saving</p>
                    <p className="text-amber">₹{formatINR(annualSaving)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">10yr (12% gross)</p>
                    <p className="text-amber font-semibold">You lose: ₹{formatINR(savings)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 font-body border-l-2 border-amber/30 pl-3">
                  That is <span className="text-amber font-mono font-semibold">{monthsOfSIP} months</span> of equivalent SIP
                </p>
              </div>
            );
          })}

          {/* Portfolio Total */}
          <div className="p-5 bg-surface/20 border border-amber/10 rounded-[2px]">
            <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider mb-1">If you switch ALL regular funds to direct</p>
            <p className="font-mono text-2xl text-amber font-bold">Additional: ₹{formatINR(portfolioTotal)} <span className="text-sm text-muted-foreground font-normal">over 10 years</span></p>
            <button
              onClick={() => setShowExplainer(true)}
              className="mt-3 text-[10px] uppercase tracking-wider font-mono text-amber border border-amber/20 bg-amber/5 px-3 py-1.5 rounded-[2px] hover:bg-amber/10 transition-colors"
            >
              How to switch to Direct →
            </button>
          </div>
        </>
      )}

      {/* Explainer Modal */}
      {showExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6" onClick={() => setShowExplainer(false)}>
          <div className="bg-card border border-surface-border rounded-[2px] p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">How to Switch to Direct Plans</h3>
            <div className="space-y-3 text-sm font-body text-muted-foreground">
              <p>1. <strong className="text-foreground">Redeem</strong> from Regular plan through your broker/distributor.</p>
              <p>2. <strong className="text-foreground">Reinvest</strong> in the Direct plan of the same fund via AMC website or direct platforms (Kuvera, MFCentral, etc.).</p>
              <p>3. <strong className="text-amber">Check exit load</strong> before switching — if held less than 1 year, 1% exit load may apply.</p>
              <p>4. <strong className="text-amber">Consider tax implications</strong> — redemption triggers STCG or LTCG depending on holding period.</p>
            </div>
            <button onClick={() => setShowExplainer(false)} className="mt-6 w-full text-center py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground border border-surface-border rounded-[2px] transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularVsDirectTab;
