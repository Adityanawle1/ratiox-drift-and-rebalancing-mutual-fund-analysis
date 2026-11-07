import { useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { formatINR } from "@/lib/fee-calculator";
import { differenceInDays, addDays, format } from "date-fns";

interface Props {
  holdings: HoldingWithValue[];
}

const ExitLoadMonitor = ({ holdings }: Props) => {
  const today = useMemo(() => new Date(), []);

  const exitLoadData = useMemo(() => {
    return holdings.map(h => {
      if (!h.purchaseDate) return { ...h, status: "no_date" as const, daysUntilFree: 0, exitLoad: 0, freeDate: null };
      const purchaseDate = new Date(h.purchaseDate);
      // Most equity MFs charge 1% exit load if redeemed within 1 year
      const exitLoadFreeDate = addDays(purchaseDate, 365);
      const daysUntilFree = differenceInDays(exitLoadFreeDate, today);
      const exitLoad = daysUntilFree > 0 ? h.marketValue * 0.01 : 0;
      return {
        ...h,
        status: daysUntilFree > 0 ? ("locked" as const) : ("free" as const),
        daysUntilFree,
        exitLoad,
        freeDate: exitLoadFreeDate,
      };
    });
  }, [holdings, today]);

  const lockedFunds = exitLoadData.filter(d => d.status === "locked");
  const freeFunds = exitLoadData.filter(d => d.status === "free");
  const noDateFunds = exitLoadData.filter(d => d.status === "no_date");

  return (
    <div className="space-y-6">
      {/* Urgent Banner */}
      {lockedFunds.length > 0 && (
        <div className="p-4 bg-amber/5 border border-amber/20 rounded-[2px]">
          <p className="text-[10px] uppercase tracking-widest font-mono text-amber font-semibold mb-1">⚠️ Exit Load Active</p>
          <p className="text-xs text-muted-foreground font-body">
            {lockedFunds.length} fund(s) have exit load. If you plan to rebalance, check timing below.
          </p>
        </div>
      )}

      {/* Locked Funds */}
      {lockedFunds.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Exit Load Applies</h3>
          {lockedFunds.map(h => (
            <div key={h.id} className="p-4 border border-amber/20 bg-card rounded-[2px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">⚠️ {h.symbol}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{h.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-amber font-semibold">{h.daysUntilFree} days left</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Exit load: ₹{formatINR(h.exitLoad)}</p>
                </div>
              </div>
              {h.freeDate && (
                <p className="text-[10px] text-muted-foreground font-body mt-2">
                  Free to exit from: <span className="text-foreground font-mono">{format(h.freeDate, "dd MMM yyyy")}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Free Funds */}
      {freeFunds.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No Exit Load</h3>
          {freeFunds.map(h => (
            <div key={h.id} className="p-3 border border-surface-border bg-card rounded-[2px] flex justify-between items-center">
              <div>
                <p className="font-mono text-sm text-foreground">{h.symbol}</p>
                <p className="text-[10px] text-muted-foreground font-body">{h.name}</p>
              </div>
              <span className="text-xs text-drift-green font-mono">✅ Free to redeem</span>
            </div>
          ))}
        </div>
      )}

      {/* No Date */}
      {noDateFunds.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Purchase Date Missing</h3>
          {noDateFunds.map(h => (
            <div key={h.id} className="p-3 border border-dashed border-surface-border bg-surface/10 rounded-[2px] flex justify-between items-center">
              <p className="font-mono text-sm text-foreground">{h.symbol}</p>
              <span className="text-xs text-muted-foreground font-body">Add purchase date to check exit load</span>
            </div>
          ))}
        </div>
      )}

      {holdings.length === 0 && (
        <div className="p-8 text-center border border-dashed border-surface-border rounded-[2px]">
          <p className="text-sm text-muted-foreground font-body">No holdings to analyze.</p>
        </div>
      )}
    </div>
  );
};

export default ExitLoadMonitor;
