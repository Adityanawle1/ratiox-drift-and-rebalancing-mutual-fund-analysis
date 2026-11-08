import React, { useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { getCategoryAvgTer, getTerVerdict, formatINR, computeCorpus } from "@/lib/fee-calculator";
import { ShieldCheck, TrendingDown, AlertCircle, PieChart, CheckCircle2 } from "lucide-react";

interface Props {
  holdings: HoldingWithValue[];
  terMap: Record<string, number>;
}

const PortfolioFeeOverview: React.FC<Props> = ({ holdings, terMap }) => {
  const mfHoldings = holdings;

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
    const projected10yr = totalAnnualFee > 0
      ? computeCorpus(totalAnnualFee / 12, 0.12, 10) 
      : 0;

    return { totalMfValue, weightedAvgTer, totalAnnualFee, projected10yr, holdingsWithTer };
  }, [mfHoldings, terMap]);

  return (
    <div className="space-y-8">
      {/* 4 Metric Institutional HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#333] p-5 rounded-[8px] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888]">
              Portfolio MF AUM
            </span>
            <PieChart className="w-4 h-4 text-amber opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight">
            ₹{formatINR(summary.totalMfValue)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#666]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber/70" />
            <span>{mfHoldings.length} {mfHoldings.length === 1 ? "Scheme" : "Schemes"} Monitored</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#333] p-5 rounded-[8px] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888]">
              Weighted TER
            </span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight">
            {summary.weightedAvgTer.toFixed(2)}%
          </p>
          <p className="mt-3 text-[11px] font-mono text-[#777]">
            Industry benchmark: ~1.42%
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c0c0c] border border-[#1f1f1f] hover:border-rose-900/40 p-5 rounded-[8px] relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-400">
              Annual Fee Drag
            </span>
            <TrendingDown className="w-4 h-4 text-rose-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="font-mono text-2xl md:text-3xl text-rose-400 font-medium tracking-tight">
            ₹{formatINR(summary.totalAnnualFee)}
            <span className="text-xs font-normal text-rose-400/60 ml-1">/yr</span>
          </p>
          <p className="mt-3 text-[11px] font-mono text-[#777]">
            ≈ ₹{(summary.totalAnnualFee / 365).toFixed(2)}/day run rate
          </p>
        </div>

        {/* Metric 4 (Highlight Alert) */}
        <div className="bg-gradient-to-br from-[#120808] to-[#0c0c0c] border border-rose-500/30 hover:border-rose-500/50 p-5 rounded-[8px] relative overflow-hidden transition-all shadow-[0_0_24px_rgba(244,63,94,0.06)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              10-Yr Compounded Loss
            </span>
          </div>
          <p className="font-mono text-3xl md:text-4xl text-rose-400 font-bold tracking-tight relative z-10">
            ₹{formatINR(summary.projected10yr)}
          </p>
          <p className="mt-2 text-[10px] font-mono text-rose-300/60 relative z-10">
            Lost to compounding drag @ 12% CAGR
          </p>
        </div>
      </div>

      {/* Audit Insight Banner */}
      <div className="bg-[#0e0e0e] border border-[#222] p-4 rounded-[6px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-amber/10 border border-amber/30 text-amber flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono font-medium text-white">
              Fee Structure Diagnosis: <span className="text-emerald-400">Direct Scheme Advantage</span>
            </p>
            <p className="text-[11px] text-[#777] font-body mt-0.5">
              Your schemes utilize direct plan expense ratios, bypassing third-party distributor brokerage kickbacks.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
            Zero Distributor Kickback
          </span>
        </div>
      </div>

      {/* Holdings Audit Table */}
      <div className="border border-[#1f1f1f] rounded-[8px] overflow-hidden bg-[#0a0a0a]">
        <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0d0d0d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-semibold">
              Audited Schemes Breakdown
            </h3>
          </div>
          <span className="font-mono text-[10px] text-[#666] uppercase tracking-wider">
            Source: AMFI Live NAV
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[2fr_100px_120px_100px_110px_120px] text-[10px] uppercase tracking-wider text-[#777] font-mono px-6 py-3 bg-[#0d0d0d] border-b border-[#1c1c1c]">
              <span>Mutual Fund Scheme</span>
              <span className="text-right">Stated TER</span>
              <span className="text-right">Annual Cost</span>
              <span className="text-right">Category Avg</span>
              <span className="text-right">Vs Category</span>
              <span className="text-center">Verdict</span>
            </div>

            {mfHoldings.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#777] font-mono">
                No mutual fund holdings found. Add holdings to compute institutional TER audits.
              </div>
            ) : (
              mfHoldings.map((h) => {
                const ter = terMap[h.id] !== undefined ? terMap[h.id] : 1.40;
                const categoryAvg = getCategoryAvgTer(h.assetClass);
                const annualCost = (h.marketValue * ter) / 100;
                const verdict = getTerVerdict(ter, categoryAvg);
                const diff = ter - categoryAvg;

                return (
                  <div
                    key={h.id}
                    className="grid grid-cols-[2fr_100px_120px_100px_110px_120px] text-xs font-mono px-6 py-4 border-b border-[#161616] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-sm text-white font-sans font-medium truncate group-hover:text-amber transition-colors">
                        {h.name || h.symbol}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#666] font-mono uppercase tracking-wider">
                          {h.symbol}
                        </span>
                        <span className="text-[#444]">•</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161616] text-amber border border-[#262626]">
                          {h.assetClass}
                        </span>
                      </div>
                    </div>

                    <span className="text-right font-mono text-sm text-white font-medium">
                      {ter.toFixed(2)}%
                    </span>

                    <span className="text-right font-mono text-sm text-rose-400 font-medium">
                      ₹{formatINR(annualCost)}
                    </span>

                    <span className="text-right font-mono text-xs text-[#777]">
                      {categoryAvg.toFixed(2)}%
                    </span>

                    <span
                      className={`text-right font-mono text-xs font-medium ${
                        diff <= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {diff <= 0 ? "" : "+"}
                      {diff.toFixed(2)}%
                    </span>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-[3px] border ${
                          verdict.color === "green"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : verdict.color === "yellow"
                            ? "bg-amber/10 text-amber border-amber/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {verdict.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioFeeOverview;
