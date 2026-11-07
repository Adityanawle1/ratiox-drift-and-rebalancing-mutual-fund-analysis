import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addHolding, addHoldingsBatch } from "@/api/portfolio";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Upload, X, Check, AlertTriangle } from "lucide-react";

interface ImportCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  userId: string;
  assetClasses: string[];
  onSuccess: () => void;
}

interface ParsedRow {
  symbol: string;
  quantity: number;
  avgPrice: number;
  assetClass: string;
  originalIndex: number;
  isValid: boolean;
  error?: string;
}

const selectClass =
  "w-full bg-background border border-surface-border rounded-sm px-2 py-1 text-xs text-foreground font-body focus:outline-none focus:ring-1 focus:ring-amber";

const ImportCSVModal = ({ open, onOpenChange, portfolioId, userId, assetClasses, onSuccess }: ImportCSVModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = () => {
    setParsedData([]);
    setStep("upload");
    setImporting(false);
    setProgress(0);
  };

  const autoDetectAssetClass = (symbol: string): string => {
    const sym = symbol.toUpperCase();
    if (sym.endsWith("BEES") || sym.endsWith("ETF")) return "ETF";
    
    const largeCaps = ["RELIANCE", "TCS", "HDFC", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT", "HINDUNILVR", "AXISBANK"];
    if (largeCaps.includes(sym)) return "Large Cap Equity";
    
    // Default to the first available asset class or "Equity"
    return assetClasses[0] || "Equity";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = [];
        
        results.data.forEach((row: Record<string, string>, index) => {
          let symbol = "";
          let quantity = 0;
          let avgPrice = 0;
          let isValid = true;
          let errorMessage = "";

          // Auto-detect broker format based on columns
          if (row["Instrument"] && row["Qty."] && row["Avg. cost"]) {
            // Zerodha
            symbol = row["Instrument"];
            quantity = parseFloat(row["Qty."].replace(/,/g, ''));
            avgPrice = parseFloat(row["Avg. cost"].replace(/,/g, ''));
          } else if (row["Instrument"] && typeof row["Qty"] === "string") {
            // Zerodha alternate
            symbol = row["Instrument"];
            quantity = parseFloat(row["Qty"].replace(/,/g, ''));
            avgPrice = parseFloat((row["Avg cost"] || row["Avg. cost"] || "0").replace(/,/g, ''));
          } else if (row["Stock Name"] && row["Ticker"]) {
            // Groww
            symbol = row["Ticker"];
            quantity = parseFloat((row["Quantity"] || "0").toString().replace(/,/g, ''));
            avgPrice = parseFloat((row["Average Price"] || "0").toString().replace(/,/g, ''));
          } else {
            // Generic / Angel One fallback
            symbol = row["Symbol"] || row["Ticker"] || row["Instrument"] || "";
            const rawQty = row["Quantity"] || row["Qty"] || row["Qty."] || "0";
            const rawPrice = row["Avg Price"] || row["Average Price"] || row["Buy Price"] || row["Avg Cost"] || row["Avg. cost"] || "0";
            
            quantity = parseFloat(rawQty.toString().replace(/,/g, ''));
            avgPrice = parseFloat(rawPrice.toString().replace(/,/g, ''));
          }

          if (!symbol) {
            isValid = false;
            errorMessage = "Missing Symbol";
          } else if (isNaN(quantity) || quantity <= 0) {
            isValid = false;
            errorMessage = "Invalid Quantity";
            quantity = 0;
          } else if (isNaN(avgPrice) || avgPrice <= 0) {
            isValid = false;
            errorMessage = "Invalid Avg Price";
            avgPrice = 0;
          }

          rows.push({
            originalIndex: index,
            symbol: symbol.trim(),
            quantity,
            avgPrice,
            assetClass: isValid ? autoDetectAssetClass(symbol.trim()) : "",
            isValid,
            error: errorMessage
          });
        });

        setParsedData(rows);
        setStep("preview");
        setLoading(false);
      },
      error: (err) => {
        console.error(err);
        toast({ title: "Failed to parse CSV", variant: "destructive" });
        setLoading(false);
      }
    });
  };

  const handleAssetClassChange = (index: number, newClass: string) => {
    const updated = [...parsedData];
    updated[index].assetClass = newClass;
    setParsedData(updated);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setImporting(true);
    setProgress(50);

    const formattedData = validRows.map(row => ({
      symbol: row.symbol,
      assetClass: row.assetClass,
      quantity: row.quantity,
      avgPrice: row.avgPrice,
    }));

    const { error, successCount } = await addHoldingsBatch(portfolioId, userId, formattedData);

    setProgress(100);
    setImporting(false);

    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Successfully imported ${successCount} holdings.` });
      onSuccess();
      onOpenChange(false);
    }
  };

  const validCount = parsedData.filter(r => r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-surface-border max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Import CSV</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="mt-4">
            <div className="border-2 border-dashed border-surface-border rounded-lg p-12 text-center hover:bg-surface/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-display text-foreground mb-2">Upload Broker Portolio CSV</h3>
              <p className="text-xs text-muted-foreground font-body mb-6 max-w-sm mx-auto">
                We support Zerodha, Groww, and Angel One export formats. Generic formats require Symbol, Quantity, and Avg Price columns.
              </p>
              
              <label className="bg-amber text-background px-4 py-2 rounded-sm text-sm font-medium hover:brightness-110 transition-colors cursor-pointer inline-flex items-center">
                {loading ? "Processing..." : "Select CSV File"}
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="mt-4 flex flex-col max-h-[70vh]">
            <div className="flex justify-between items-end mb-4 shrink-0">
              <div>
                <h3 className="text-sm font-body text-foreground">Preview Import Data</h3>
                <p className="text-xs text-muted-foreground mt-1">Found {parsedData.length} records ({validCount} valid).</p>
              </div>
              <button
                onClick={() => setStep("upload")}
                disabled={importing}
                className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
              >
                Change File
              </button>
            </div>

            <div className="overflow-y-auto border border-surface-border rounded-sm bg-background flex-1">
              <table className="w-full text-left text-sm font-body">
                <thead className="text-xs text-muted-foreground border-b border-surface-border bg-surface/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Symbol</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Avg Price</th>
                    <th className="px-4 py-2 font-medium">Asset Class</th>
                    <th className="px-4 py-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? "hover:bg-surface/30" : "bg-drift-red/5"}>
                      <td className="px-4 py-2 font-mono text-xs">{row.symbol || "—"}</td>
                      <td className="px-4 py-2 font-mono text-xs text-right">{row.isValid ? row.quantity : "—"}</td>
                      <td className="px-4 py-2 font-mono text-xs text-right">{row.isValid ? `₹${row.avgPrice}` : "—"}</td>
                      <td className="px-4 py-2">
                        {row.isValid ? (
                          <div className="w-40">
                            {assetClasses.length > 0 ? (
                              <select 
                                value={row.assetClass} 
                                onChange={e => handleAssetClassChange(idx, e.target.value)} 
                                className={selectClass}
                                disabled={importing}
                              >
                                {assetClasses.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                              </select>
                            ) : (
                              <input 
                                value={row.assetClass} 
                                onChange={e => handleAssetClassChange(idx, e.target.value)} 
                                placeholder="e.g. Equity" 
                                className={selectClass}
                                disabled={importing}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-drift-red">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {row.isValid ? (
                          <Check className="w-4 h-4 text-drift-green mx-auto" />
                        ) : (
                          <div className="flex items-center justify-center text-drift-red gap-1" title={row.error}>
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] whitespace-nowrap">{row.error}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 shrink-0">
              {importing && (
                <div className="w-full h-1 bg-surface-border mb-4 rounded-full overflow-hidden">
                  <div className="h-full bg-amber transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={importing}
                  className="px-4 py-2 text-sm text-foreground font-body border border-surface-border rounded-sm hover:bg-surface transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || validCount === 0}
                  className="px-6 py-2 text-sm bg-amber text-background font-body font-medium rounded-sm hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  {importing ? "Importing..." : `Confirm Import (${validCount})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSVModal;
