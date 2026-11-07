import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateHoldingData } from "@/api/portfolio";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase";

type HoldingRow = Database['public']['Tables']['holdings']['Row'];

interface EditHoldingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: HoldingRow | null;
  onSuccess: () => void;
}

const inputClass =
  "w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber";
const selectClass =
  "w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-amber";

const EditHoldingModal = ({ open, onOpenChange, holding, onSuccess }: EditHoldingModalProps) => {
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [ter, setTer] = useState("");
  const [monthlySIPAmount, setMonthlySIPAmount] = useState("");
  const [planType, setPlanType] = useState("unknown");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holding && open) {
      setQuantity(holding.quantity.toString());
      setAvgBuyPrice(holding.avg_buy_price.toString());
      setPurchaseDate(holding.purchase_date ? holding.purchase_date.split('T')[0] : "");
      
      // We have to use as any since these fields were just added to types
      const h = holding as typeof holding & { ter?: number | null; monthly_sip?: number | null; plan_type?: string | null };
      setTer(h.ter ? h.ter.toString() : "");
      setMonthlySIPAmount(h.monthly_sip ? h.monthly_sip.toString() : "");
      setPlanType(h.plan_type || "unknown");
    }
  }, [holding, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;
    
    setError("");
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);
    
    if (qty <= 0 || isNaN(qty)) { setError("Quantity must be greater than 0"); return; }
    if (price <= 0 || isNaN(price)) { setError("Avg buy price must be greater than 0"); return; }

    setLoading(true);
    
    const { error: holdingErr } = await updateHoldingData(holding.id, {
      quantity: qty,
      avg_buy_price: price,
      purchase_date: purchaseDate || null,
      ter: ter ? parseFloat(ter) : null,
      plan_type: planType === "unknown" ? null : planType,
      monthly_sip: monthlySIPAmount ? parseFloat(monthlySIPAmount) : null,
    });

    if (holdingErr) { setError(holdingErr.message); setLoading(false); return; }

    setLoading(false);
    onOpenChange(false);
    onSuccess();
    toast({ title: "Holding updated successfully." });
  };

  if (!holding) return null;
  const instrumentType = holding.instrument_type || "equity";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-surface-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Edit {holding.symbol}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Quantity *</label>
              <input
                type="number" min="0.001" step="any"
                value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="0" required className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Avg Buy Price (₹) *</label>
              <input
                type="number" min="0.01" step="any"
                value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)}
                placeholder="0.00" required className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground font-body mb-1">
              Purchase Date (optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>

          {(instrumentType === "mf" || instrumentType === "mutualfund" || instrumentType === "mutual_fund") && (
            <div className="space-y-3 p-3 border border-surface-border/50 rounded-sm bg-surface/10">
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/80 mb-1">Mutual Fund Details (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">TER (%)</label>
                  <input
                    type="number" min="0" max="5" step="0.01"
                    value={ter} onChange={e => setTer(e.target.value)}
                    placeholder="e.g. 1.5" className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Plan Type</label>
                  <select 
                    value={planType} 
                    onChange={e => setPlanType(e.target.value)} 
                    className={selectClass}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="regular">Regular</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground font-body mb-1">Monthly SIP (₹)</label>
                <input
                  type="number" min="0" step="500"
                  value={monthlySIPAmount} onChange={e => setMonthlySIPAmount(e.target.value)}
                  placeholder="For transaction charge calculation" className={inputClass}
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-drift-red font-body">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-background font-body text-sm font-medium py-2.5 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Updating..." : "Update Holding"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHoldingModal;
