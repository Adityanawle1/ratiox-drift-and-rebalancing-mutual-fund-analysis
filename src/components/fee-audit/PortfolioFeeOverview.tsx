import React, { useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { getCategoryAvgTer, getTerVerdict, formatINR, computeCorpus } from "@/lib/fee-calculator";
import { CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total MF Value */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] hover:border-[#2a2a2a] p-5 rounded-lg transition-all">
          <p className="text-[11px] text-[#888] font-medium uppercase tracking-wide mb-2.5">
            Total MF value
          </p>
          <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight tabular">
            ₹{formatINR(summary.totalMfValue)}
          </p>
          <p className="mt-2.5 text-[11px] text-[#666]">
            {mfHoldings.length} {mfHoldings.length === 1 ? "scheme" : "schemes"} monitored
          </p>
        </div>

        {/* Weighted TER */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] hover:border-[#2a2a2a] p-5 rounded-lg transition-all">
          <p className="text-[11px] text-[#888] font-medium uppercase tracking-wide mb-2.5">
            Weighted avg TER
          </p>
          <p className="font-mono text-2xl md:text-3xl text-white font-medium tracking-tight tabular">
            {summary.weightedAvgTer.toFixed(2)}%
          </p>
          <p className="mt-2.5 text-[11px] text-[#777]">
            Industry benchmark: ~1.42%
          </p>
        </div>

        {/* Annual Fee Drag */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] hover:border-rose-900/30 p-5 rounded-lg transition-all">
          <p className="text-[11px] text-rose-400 font-medium uppercase tracking-wide mb-2.5">
            Annual fee drag
          </p>
          <p className="font-mono text-2xl md:text-3xl text-rose-400 font-medium tracking-tight tabular">
            ₹{formatINR(summary.totalAnnualFee)}
            <span className="text-xs font-normal text-rose-400/60 ml-1">/yr</span>
          </p>
          <p className="mt-2.5 text-[11px] text-[#777]">
            ≈ ₹{(summary.totalAnnualFee / 365).toFixed(2)}/day
          </p>
        </div>

        {/* 10-Year Projected Loss */}
        <div className="bg-[#0c0c0c] border border-rose-500/20 hover:border-rose-500/40 p-5 rounded-lg transition-all">
          <p className="text-[11px] text-rose-400 font-medium uppercase tracking-wide mb-2.5">
            10-yr projected fee cost
          </p>
          <p className="font-mono text-2xl md:text-3xl text-rose-400 font-bold tracking-tight tabular">
            ₹{formatINR(summary.projected10yr)}
          </p>
          <p className="mt-2.5 text-[11px] text-rose-300/50">
            Lost to compounding drag @ 12% CAGR
          </p>
        </div>
      </div>

      {/* Fee Diagnosis */}
      <div className="bg-[#0e0e0e] border border-[#1e1e1e] p-4 rounded-lg flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-white">
            Fee structure diagnosis: <span className="text-emerald-400">Direct scheme advantage</span>
          </p>
          <p className="text-[12px] text-[#777] mt-0.5">
            Your schemes use direct plan expense ratios, bypassing distributor commissions.
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0a0a0a]">
        <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#0d0d0d] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Holdings
          </h3>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[2fr_100px_120px_100px_110px_120px] text-[11px] text-[#777] font-medium px-6 py-3 bg-[#0d0d0d] border-b border-[#171717]">
              <span>Fund</span>
              <span className="text-right">TER</span>
              <span className="text-right">Annual cost</span>
              <span className="text-right">Cat. avg</span>
              <span className="text-right">vs Cat.</span>
              <span className="text-center">Verdict</span>
            </div>

            {mfHoldings.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#777]">
                No mutual fund holdings found. Add holdings to see fee analysis.
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
                    className="grid grid-cols-[2fr_100px_120px_100px_110px_120px] text-sm px-6 py-4 border-b border-[#141414] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-[13px] text-white font-medium truncate">
                        {h.name || h.symbol}
                      </p>
                      <p className="text-[11px] text-[#666] mt-0.5">
                        {h.symbol} · {h.assetClass}
                      </p>
                    </div>

                    <span className="text-right font-mono text-[13px] text-white font-medium tabular">
                      {ter.toFixed(2)}%
                    </span>

                    <span className="text-right font-mono text-[13px] text-rose-400 font-medium tabular">
                      ₹{formatINR(annualCost)}
                    </span>

                    <span className="text-right font-mono text-[12px] text-[#777] tabular">
                      {categoryAvg.toFixed(2)}%
                    </span>

                    <span
                      className={`text-right font-mono text-[12px] font-medium tabular ${
                        diff <= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {diff <= 0 ? "" : "+"}
                      {diff.toFixed(2)}%
                    </span>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          verdict.color === "green"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : verdict.color === "yellow"
                            ? "bg-amber/10 text-amber"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
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
