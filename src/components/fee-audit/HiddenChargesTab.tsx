import { useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { computeHiddenCharges, formatINR } from "@/lib/fee-calculator";

interface Props {
  holdings: HoldingWithValue[];
  terMap: Record<string, number>;
  planTypeMap: Record<string, string>;
  sipMap: Record<string, number>;
}

const HiddenChargesTab = ({ holdings, terMap, planTypeMap, sipMap }: Props) => {
  const chargesData = useMemo(() => {
    return holdings
      .filter(h => terMap[h.id] > 0)
      .map(h => {
        const ter = terMap[h.id];
        const isEquity = !h.assetClass.toLowerCase().includes("debt");
        const isRegular = (planTypeMap[h.id] || "unknown") === "regular";
        const sip = sipMap[h.id] || 0;
        const charges = computeHiddenCharges({
          currentValue: h.marketValue,
          totalInvested: h.costBasis,
          ter,
          isEquity,
          isRegularPlan: isRegular,
          monthlySIP: sip,
        });
        return { holding: h, charges };
      });
  }, [holdings, terMap, planTypeMap, sipMap]);

  // Portfolio totals
  const totals = useMemo(() => {
    const t = { expense: 0, gst: 0, stamp: 0, stt: 0, txn: 0, total: 0, portfolioValue: 0 };
    for (const d of chargesData) {
      t.expense += d.charges.expenseRatioCost;
      t.gst += d.charges.gstOnTer;
      t.stamp += d.charges.stampDuty;
      t.stt += d.charges.sttOnRedemption;
      t.txn += d.charges.transactionCharges;
      t.total += d.charges.totalRealCost;
      t.portfolioValue += d.holding.marketValue;
    }
    return t;
  }, [chargesData]);

  const statedPct = totals.portfolioValue > 0 ? ((totals.expense) / totals.portfolioValue * 100) : 0;
  const realPct = totals.portfolioValue > 0 ? (totals.total / totals.portfolioValue * 100) : 0;

  // Bar widths for visual breakdown
  const maxCharge = Math.max(totals.expense, totals.gst, totals.stamp, totals.stt, totals.txn, 1);
  const barWidth = (val: number) => `${Math.max(2, (val / maxCharge) * 100)}%`;

  if (chargesData.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-surface-border rounded-[2px]">
        <p className="font-mono text-sm text-foreground mb-2">No data available</p>
        <p className="text-xs text-muted-foreground font-body">Enter TER for your mutual fund holdings to see the full cost breakdown.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Real Cost Card */}
      <div className="p-6 bg-card border border-surface-border rounded-[2px]">
        <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-5">Total Real Annual Cost — All MF Holdings</p>

        {/* Breakdown bars */}
        <div className="space-y-3 mb-6">
          {[
            { label: "Expense Ratio (TER)", value: totals.expense, color: "bg-amber" },
            { label: "GST on TER", value: totals.gst, color: "bg-amber/60" },
            { label: "Stamp Duty", value: totals.stamp, color: "bg-foreground/30" },
            { label: "STT (if redeem)", value: totals.stt, color: "bg-foreground/20" },
            { label: "Transaction Charges", value: totals.txn, color: "bg-amber/40" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[10px] font-body text-muted-foreground w-36 shrink-0">{item.label}</span>
              <div className="flex-1 h-3 bg-surface rounded-sm overflow-hidden">
                <div className={`h-full ${item.color} rounded-sm transition-all duration-500`} style={{ width: barWidth(item.value) }} />
              </div>
              <span className="text-xs font-mono text-foreground w-20 text-right">₹{formatINR(item.value)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-surface-border pt-4 flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground font-body">Total real annual cost</p>
            <p className="font-mono text-xl text-amber font-semibold">₹{formatINR(totals.total)}</p>
            <p className="text-[10px] text-muted-foreground font-mono">As % of portfolio: {realPct.toFixed(2)}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-body text-muted-foreground">
              You thought you were paying <span className="text-foreground font-mono">{statedPct.toFixed(2)}%</span>.
            </p>
            <p className="text-sm font-body text-amber font-semibold">
              You are actually paying <span className="font-mono">{realPct.toFixed(2)}%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Per-Fund Breakdown */}
      {chargesData.map(({ holding: h, charges: c }) => (
        <details key={h.id} className="border border-surface-border rounded-[2px] bg-card group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-foreground">{h.symbol}</span>
              <span className="text-[10px] text-muted-foreground font-body">{h.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-amber">₹{formatINR(c.totalRealCost)}/yr</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-surface-border/50 space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">TER cost</span><span>₹{formatINR(c.expenseRatioCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST on TER (18%)</span><span>₹{formatINR(c.gstOnTer)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Stamp duty</span><span>₹{formatINR(c.stampDuty)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">STT (if redeem today)</span><span>₹{formatINR(c.sttOnRedemption)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Transaction charges</span><span>₹{formatINR(c.transactionCharges)}</span></div>
            <div className="flex justify-between border-t border-surface-border/50 pt-2 font-semibold">
              <span className="text-amber">Total</span><span className="text-amber">₹{formatINR(c.totalRealCost)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
              Stated TER: {c.statedTerPct.toFixed(2)}% → Real cost: ~{c.realTerPct.toFixed(2)}%
            </p>
          </div>
        </details>
      ))}
    </div>
  );
};

export default HiddenChargesTab;
