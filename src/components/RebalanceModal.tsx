import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { analyzeRebalance, HoldingWithValue, AssetClass } from "@/lib/drift-engine";
import { saveRebalanceEvent, saveRebalanceLog } from "@/api/portfolio";
import { toast } from "sonner";

interface RebalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  userId: string;
  holdings: HoldingWithValue[];
  targets: AssetClass[];
  onSuccess: () => void;
}

const RebalanceModal = ({ open, onOpenChange, portfolioId, userId, holdings, targets, onSuccess }: RebalanceModalProps) => {
  const [inflow, setInflow] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const newInflowINR = parseFloat(inflow) || 0;
  const result = analyzeRebalance(holdings, targets, newInflowINR);

  const handleAction = async (status: "executed" | "dismissed") => {
    if (status === "executed" && !confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    
    if (status === "executed") {
      // Prepare orders for the log
      const orders = result.trades.map(t => ({
        asset_class: t.assetClass,
        action: t.action,
        amount: t.amountINR
      }));

      // Save to rebalance_logs
      await saveRebalanceLog({
        user_id: userId,
        portfolio_id: portfolioId,
        orders,
        new_inflow: newInflowINR,
        before_score: result.healthScoreBefore,
        after_score: result.healthScoreAfter,
        status: "pending"
      });

      // Also save to legacy rebalance_events for compatibility
      await saveRebalanceEvent({
        portfolio_id: portfolioId,
        user_id: userId,
        snapshot: holdings,
        trades: result.trades,
        health_score_before: result.healthScoreBefore,
        health_score_after: result.healthScoreAfter,
        status: "executed",
      });

      toast.success("Rebalance analysis saved. This is for informational purposes only.");
    } else {
      await saveRebalanceEvent({
        portfolio_id: portfolioId,
        user_id: userId,
        snapshot: holdings,
        trades: result.trades,
        health_score_before: result.healthScoreBefore,
        health_score_after: result.healthScoreAfter,
        status: "dismissed",
      });
    }

    setLoading(false);
    onOpenChange(false);
    setConfirming(false); // Reset for next time
    if (status === "executed") onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-surface-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Rebalance Analysis</DialogTitle>
        </DialogHeader>

        {/* Health Score Comparison */}
        <div className="flex items-center gap-6 py-4 border-b border-surface-border">
          <div className="text-center flex-1">
            <div className="font-mono text-3xl font-semibold text-amber">
              {result.healthScoreBefore.toFixed(0)}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1">Before</p>
          </div>
          <div className="text-muted-foreground text-lg">→</div>
          <div className="text-center flex-1">
            <div className="font-mono text-3xl font-semibold text-drift-green">
              {result.healthScoreAfter.toFixed(0)}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1">After</p>
          </div>
        </div>

        {/* Inflow input */}
        <div>
          <label className="block text-xs text-muted-foreground font-body mb-1">New inflow amount (₹) — optional</label>
          <input
            type="number" min="0" step="any"
            value={inflow} onChange={e => setInflow(e.target.value)}
            placeholder="0"
            className="w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>

        {/* Trades list OR Confirmation */}
        {!confirming ? (
          <div className="space-y-0 max-h-60 overflow-y-auto">
            {result.trades.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body text-center py-6">
               Portfolio appears aligned with targets. No adjustments to display.
              </p>
            ) : (
              result.trades.map((trade, i) => (
                <div key={i} className="flex items-start justify-between py-3 border-b border-surface-border last:border-b-0">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-sm ${
                      trade.action === "buy"
                        ? "bg-drift-green/10 text-drift-green"
                        : "bg-drift-red/10 text-drift-red"
                    }`}>
                      {trade.action === "buy" ? "UNDERWEIGHT" : "OVERWEIGHT"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-body text-foreground">{trade.assetClass}</p>
                      <p className="text-xs text-muted-foreground font-body">{trade.reason}</p>
                      {trade.taxWarning && (
                        <p className="text-xs font-body mt-1 text-amber">{trade.taxWarning}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-mono text-foreground whitespace-nowrap ml-4">
                    ₹{trade.amountINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-foreground font-body leading-relaxed mb-1">
              This will save your rebalance analysis.
            </p>
            <p className="text-sm text-muted-foreground font-body">
              This is for informational purposes only — not investment advice.
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-body mt-3">
              Consult a SEBI-registered advisor before making any financial decisions.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
            <button
              onClick={() => confirming ? setConfirming(false) : handleAction("dismissed")}
              disabled={loading}
              className="flex-1 border border-surface-border text-muted-foreground font-body text-sm py-2.5 rounded-sm hover:text-foreground hover:border-foreground transition-all disabled:opacity-50"
            >
              {confirming ? "Cancel" : "Dismiss"}
            </button>
          <button
            onClick={() => handleAction("executed")}
            disabled={loading || (!confirming && result.trades.length === 0)}
            className="flex-1 bg-amber text-background font-body text-sm font-medium py-2.5 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : confirming ? "Save Analysis" : "View Analysis"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RebalanceModal;
