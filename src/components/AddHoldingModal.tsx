import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addHolding, addTransaction } from "@/api/portfolio";
import { searchAllInstruments, fetchYahooPrice, fetchMFNav, SearchResult } from "@/lib/market-data";
import { useToast } from "@/hooks/use-toast";

interface AddHoldingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  userId: string;
  assetClasses: string[];
  onSuccess: () => void;
}

const inputClass =
  "w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber";
const selectClass =
  "w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-amber";

const INSTRUMENT_TYPES = ["equity", "mf", "etf", "gold", "reit", "debt"];

const AddHoldingModal = ({ open, onOpenChange, portfolioId, userId, assetClasses, onSuccess }: AddHoldingModalProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [assetClass, setAssetClass] = useState(assetClasses[0] || "");
  const [instrumentType, setInstrumentType] = useState("equity");
  const [quantity, setQuantity] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [ter, setTer] = useState("");
  const [monthlySIPAmount, setMonthlySIPAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState("unknown");

  // Auto-fill TER data from search
  const [autoFillTERs, setAutoFillTERs] = useState<{regular?: number, direct?: number} | null>(null);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setShowDropdown(false); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAllInstruments(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSearching(false);
    }, 350);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [query]);

  const handleSelectSuggestion = async (result: SearchResult) => {
    setSymbol(result.symbol);
    setName(result.name);
    setQuery(`${result.symbol} — ${result.name}`);
    setShowDropdown(false);
    setSuggestions([]);

    // Automatically set instrument type if known
    if (result.type === 'mf') {
      setInstrumentType('mf');
      if (result.regular_ter !== undefined || result.direct_ter !== undefined) {
        setAutoFillTERs({ regular: result.regular_ter, direct: result.direct_ter });
        // By default, assume regular plan and fill it, user can change it
        if (result.regular_ter !== undefined) {
          setPlanType('regular');
          setTer(result.regular_ter.toString());
        }
      }
    }
    else if (result.type === 'etf') setInstrumentType('etf');
    else if (result.type === 'equity') setInstrumentType('equity');

    // Use price already fetched during search, or fetch if missing
    if (result.price) {
      setLivePrice(result.price);
      setAvgBuyPrice(result.price.toFixed(2));
    } else {
      setPriceLoading(true);
      if (result.type === 'mf') {
        const priceData = await fetchMFNav(result.symbol);
        if (priceData) {
          setLivePrice(priceData.price);
          setAvgBuyPrice(priceData.price.toFixed(2));
        }
      } else {
        const priceData = await fetchYahooPrice(result.symbol);
        if (priceData) {
          setLivePrice(priceData.price);
          setAvgBuyPrice(priceData.price.toFixed(2));
        }
      }
      setPriceLoading(false);
    }
  };

  const reset = () => {
    setQuery(""); setSymbol(""); setName(""); setLivePrice(null);
    setAssetClass(assetClasses[0] || ""); setInstrumentType("equity");
    setQuantity(""); setAvgBuyPrice(""); setPurchaseDate(""); setError("");
    setTer(""); setPlanType("unknown"); setMonthlySIPAmount("");
    setAutoFillTERs(null);
    setSuggestions([]); setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);
    if (!symbol) { setError("Please search and select a stock"); return; }
    if (qty <= 0 || isNaN(qty)) { setError("Quantity must be greater than 0"); return; }
    if (price <= 0 || isNaN(price)) { setError("Avg buy price must be greater than 0"); return; }

    setLoading(true);
    const { error: holdingErr } = await addHolding({
      portfolio_id: portfolioId,
      user_id: userId,
      symbol: symbol.toUpperCase(),
      name: name || undefined,
      asset_class: assetClass,
      instrument_type: instrumentType,
      quantity: qty,
      avg_buy_price: price,
      purchase_date: purchaseDate || null,
      ter: instrumentType === "mf" && ter ? parseFloat(ter) : undefined,
      plan_type: instrumentType === "mf" ? planType : undefined,
      monthly_sip: instrumentType === "mf" && monthlySIPAmount ? parseFloat(monthlySIPAmount) : undefined,
    });

    if (holdingErr) { setError(holdingErr.message); setLoading(false); return; }

    await addTransaction({
      portfolio_id: portfolioId,
      user_id: userId,
      symbol: symbol.toUpperCase(),
      transaction_type: "buy",
      quantity: qty,
      price,
    });

    setLoading(false);
    reset();
    onOpenChange(false);
    onSuccess();
    toast({ title: "Holding added successfully." });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-surface-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Add Holding</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Search */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs text-muted-foreground font-body mb-1">Search Instrument (Stock, MF, ETF...) *</label>
            <div className="relative">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setSymbol(""); setLivePrice(null); }}
                placeholder="e.g. Reliance, Parag Parikh, NIFTYBEES..."
                autoComplete="off"
                className={inputClass}
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-body animate-pulse">
                  searching...
                </span>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-surface-border rounded-sm shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.symbol}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-surface-border last:border-b-0"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-mono text-amber">{s.symbol}</span>
                      <span className="text-xs text-muted-foreground font-body truncate">{s.name}</span>
                    </div>
                    <div className="ml-3 text-right shrink-0">
                      {s.price ? (
                        <span className="text-sm font-mono text-drift-green">
                          ₹{s.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-body">{s.exchange || "NSE"}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live price badge */}
          {symbol && (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-sm">
              <span className="text-xs font-mono text-amber font-semibold">{symbol}</span>
              <span className="text-xs text-muted-foreground font-body flex-1 truncate">{name}</span>
              {priceLoading ? (
                <span className="text-xs text-muted-foreground font-body animate-pulse">fetching price...</span>
              ) : livePrice ? (
                <span className="text-xs font-mono text-drift-green">₹{livePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              ) : (
                <span className="text-xs text-muted-foreground font-body">price unavailable</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Asset Class *</label>
              {assetClasses.length > 0 ? (
                <select value={assetClass} onChange={e => setAssetClass(e.target.value)} className={selectClass} required>
                  {assetClasses.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                </select>
              ) : (
                <input value={assetClass} onChange={e => setAssetClass(e.target.value)} placeholder="e.g. Mid Cap Equity" required className={inputClass} />
              )}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1">Instrument Type *</label>
              <select value={instrumentType} onChange={e => setInstrumentType(e.target.value)} className={selectClass}>
                {INSTRUMENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

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
              <label className="block text-xs text-muted-foreground font-body mb-1">
                Avg Buy Price (₹) *
                {livePrice && <span className="ml-1 text-drift-green">· live</span>}
              </label>
              <input
                type="number" min="0.01" step="any"
                value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)}
                placeholder="0.00" required className={inputClass}
              />
            </div>
          </div>

          {/* Purchase Date - Optional */}
          <div>
            <label className="block text-xs text-muted-foreground font-body mb-1">
              Purchase Date (optional — for tax & CAGR calculation)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>

          {/* MF-specific optional fields — only shown when instrument type is Mutual Fund */}
          {instrumentType === "mf" && (
            <div className="space-y-3 p-3 border border-surface-border/50 rounded-sm bg-surface/10">
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/80 mb-1">Mutual Fund Details (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Expense Ratio / TER (%)</label>
                  <input
                    type="number" min="0" max="5" step="0.01"
                    value={ter} onChange={e => setTer(e.target.value)}
                    placeholder="e.g. 1.5" className={inputClass}
                  />
                  <p className="text-[9px] text-muted-foreground/50 font-body mt-0.5">Find on AMFI website or fund factsheet</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground font-body mb-1">Plan Type</label>
                  <select 
                    value={planType} 
                    onChange={e => {
                      const newType = e.target.value;
                      setPlanType(newType);
                      // Auto-update TER based on plan selection if we have the data
                      if (autoFillTERs) {
                        if (newType === 'regular' && autoFillTERs.regular !== undefined) {
                          setTer(autoFillTERs.regular.toString());
                        } else if (newType === 'direct' && autoFillTERs.direct !== undefined) {
                          setTer(autoFillTERs.direct.toString());
                        }
                      }
                    }} 
                    className={selectClass}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="regular">Regular</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground font-body mb-1">Monthly SIP (₹) — if applicable</label>
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
            disabled={loading || !symbol}
            className="w-full bg-amber text-background font-body text-sm font-medium py-2.5 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Adding..." : "Add Holding"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHoldingModal;
