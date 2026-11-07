import { useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { getCategoryAvgTer, getTerVerdict, formatINR, computeCorpus } from "@/lib/fee-calculator";

interface Props {
  holdings: HoldingWithValue[];
  terMap: Record<string, number>;
}

const PortfolioFeeOverview = ({ holdings, terMap }: Props) => {
  const mfHoldings = holdings; // Already pre-filtered to MF holdings by FeeAudit parent


  const summary = useMemo(() => {
    let totalMfValue = 0;
    let weightedTerSum = 0;
    let totalAnnualFee = 0;
    let holdingsWithTer = 0;

    for (const h of mfHoldings) {
      const ter = terMap[h.id];
      totalMfValue += h.marketValue;
      if (ter !== undefined && ter > 0) {
        weightedTerSum += ter * h.marketValue;
        totalAnnualFee += (h.marketValue * ter) / 100;
        holdingsWithTer++;
      }
    }

    const weightedAvgTer = totalMfValue > 0 ? weightedTerSum / totalMfValue : 0;
    // 10-year projected fee cost using 12% gross return assumption
    const projected10yr = totalAnnualFee > 0
      ? computeCorpus(totalAnnualFee / 12, 0.12, 10) 
      : 0;

    return { totalMfValue, weightedAvgTer, totalAnnualFee, projected10yr, holdingsWithTer };
  }, [mfHoldings, terMap]);

  const verdictColor = { green: "text-drift-green", yellow: "text-amber", red: "text-drift-red" };

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-card/40 border border-surface-border/50 glass shadow-premium rounded-[12px] card-hover-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-drift-red/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-widest mb-2">Total MF Value</p>
          <p className="font-mono text-2xl text-foreground text-premium">₹{formatINR(summary.totalMfValue)}</p>
        </div>
        <div className="relative z-10">
          <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-widest mb-2">Weighted Avg TER</p>
          <p className="font-mono text-2xl text-foreground text-premium">{summary.weightedAvgTer.toFixed(2)}%</p>
        </div>
        <div className="relative z-10">
          <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-widest mb-2">Annual Fee Drag</p>
          <p className="font-mono text-2xl text-drift-red text-premium drop-shadow-sm">₹{formatINR(summary.totalAnnualFee)}<span className="text-sm opacity-60">/yr</span></p>
        </div>
        <div className="border-l border-surface-border/50 pl-6 relative z-10">
          <p className="text-[11px] text-drift-red uppercase font-mono tracking-widest mb-2 font-semibold">10-Year Projected Fee Cost</p>
          <p className="font-mono text-4xl text-drift-red font-bold drop-shadow-md">
            ₹{formatINR(summary.projected10yr)}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-surface-border rounded-[2px] overflow-hidden">
        <div className="grid grid-cols-[1.5fr_60px_80px_80px_70px_80px] text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-4 py-2.5 bg-surface/30 border-b border-surface-border">
          <span>Fund</span>
          <span className="text-right">TER</span>
          <span className="text-right">Annual Cost</span>
          <span className="text-right">Cat. Avg</span>
          <span className="text-right">vs Cat.</span>
          <span className="text-center">Verdict</span>
        </div>
        {mfHoldings.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-body">
            No mutual fund holdings found. Add holdings with asset classes containing "Fund" or "ETF".
          </div>
        ) : (
          mfHoldings.map(h => {
            const ter = terMap[h.id];
            const categoryAvg = getCategoryAvgTer(h.assetClass);
            const hasTer = ter !== undefined && ter > 0;
            const annualCost = hasTer ? (h.marketValue * ter) / 100 : 0;
            const verdict = hasTer ? getTerVerdict(ter, categoryAvg) : null;
            const diff = hasTer ? ter - categoryAvg : 0;

            return (
              <div key={h.id} className="grid grid-cols-[1.5fr_60px_80px_80px_70px_80px] text-sm font-body px-4 py-3 border-b border-surface-border last:border-b-0 hover:bg-surface/20 transition-colors items-center">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-foreground truncate">{h.symbol}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{h.name}</p>
                </div>
                {hasTer ? (
                  <>
                    <span className="text-right font-mono text-xs text-foreground">{ter.toFixed(2)}%</span>
                    <span className="text-right font-mono text-xs text-foreground">₹{formatINR(annualCost)}</span>
                    <span className="text-right font-mono text-xs text-muted-foreground">{categoryAvg.toFixed(2)}%</span>
                    <span className={`text-right font-mono text-xs ${diff > 0 ? "text-drift-red" : "text-drift-green"}`}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(2)}%
                    </span>
                    <span className={`text-center text-xs font-mono ${verdictColor[verdict!.color]}`}>
                      {verdict!.emoji} {verdict!.label}
                    </span>
                  </>
                ) : (
                  <span className="col-span-5 text-xs text-muted-foreground/60 font-body italic text-center">
                    Enter TER to see fee analysis
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PortfolioFeeOverview;
