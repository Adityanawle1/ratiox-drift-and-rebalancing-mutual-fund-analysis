import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { Download, Copy, Share2, Check, Smartphone, Monitor } from "lucide-react";
import { DriftResult } from "@/lib/drift-engine";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SharePortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    healthScore: number;
    totalValue: number;
    totalInvested: number;
    pnl: number;
    pnlPct: number;
    holdingsCount: number;
    lastRebalanced: string | Date | null;
    driftResults: DriftResult[];
  };
}

export default function SharePortfolioModal({ open, onOpenChange, data }: SharePortfolioModalProps) {
  const [aspectRatio, setAspectRatio] = useState<"square" | "wide">("square");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const dimensions = {
    square: { width: 1080, height: 1080 },
    wide: { width: 1200, height: 630 },
  };

  const currentDims = dimensions[aspectRatio];

  const generatePreview = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      // Ensure fonts are loaded before capturing
      await document.fonts.ready;
      
      const canvas = await html2canvas(cardRef.current, {
        width: currentDims.width,
        height: currentDims.height,
        scale: 1,
        backgroundColor: "#0a0a0a",
        useCORS: true,
        logging: false,
      });
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Failed to generate preview:", err);
      toast({ variant: "destructive", title: "Failed to generate preview" });
    } finally {
      setGenerating(false);
    }
  }, [currentDims.width, currentDims.height, toast]);

  useEffect(() => {
    if (open) {
      // Small timeout to allow the hidden card to be in DOM
      const timer = setTimeout(generatePreview, 500);
      return () => clearTimeout(timer);
    } else {
      setPreviewUrl(null);
    }
  }, [open, aspectRatio, data, generatePreview]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `ratio-x-portfolio-health-${format(new Date(), "yyyy-MM-dd")}.png`;
    link.href = previewUrl;
    link.click();
    toast({ title: "Image downloaded successfully" });
  };

  const handleCopy = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Image copied to clipboard" });
    } catch (err) {
      console.error("Failed to copy image:", err);
      toast({ variant: "destructive", title: "Failed to copy image" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-surface-border max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display font-medium text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber" />
            Export Tear Sheet
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-6 py-4">
            {/* Format Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAspectRatio("square")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${
                  aspectRatio === "square" 
                  ? "bg-amber/10 border-amber/40 text-amber" 
                  : "bg-surface border-surface-border text-muted-foreground hover:text-foreground hover:border-surface-border/80"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-xs font-mono uppercase tracking-wider">1:1 Square</span>
              </button>
              <button
                onClick={() => setAspectRatio("wide")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${
                  aspectRatio === "wide" 
                  ? "bg-amber/10 border-amber/40 text-amber" 
                  : "bg-surface border-surface-border text-muted-foreground hover:text-foreground hover:border-surface-border/80"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-xs font-mono uppercase tracking-wider">16:9 Landscape</span>
              </button>
            </div>

            {/* Preview Section */}
            <div className="relative aspect-video bg-black/40 border border-surface-border rounded-sm flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Rendering frame...</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownload}
                disabled={!previewUrl || generating}
                className="flex-1 bg-amber text-background font-body text-sm font-medium px-4 py-2.5 rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Save Report
              </button>
              <button
                onClick={handleCopy}
                disabled={!previewUrl || generating}
                className="flex-1 border border-surface-border bg-transparent text-foreground font-body text-sm font-medium px-4 py-2.5 rounded-sm hover:bg-surface transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-drift-green" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden Render Target - Full resolution */}
        <div className="fixed -left-[4000px] -top-[4000px] pointer-events-none">
          <div
            ref={cardRef}
            style={{
              width: `${currentDims.width}px`,
              height: `${currentDims.height}px`,
              background: "#0a0a0a",
              color: "#f5a623",
              display: "flex",
              flexDirection: "column",
              padding: aspectRatio === "square" ? "80px" : "60px 80px",
              fontFamily: "'Space Grotesk', sans-serif",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Design Elements */}
            <div 
              style={{
                position: "absolute",
                top: "-10%",
                right: "-10%",
                width: "40%",
                height: "40%",
                background: "radial-gradient(circle, rgba(245, 166, 35, 0.05) 0%, transparent 70%)",
                filter: "blur(40px)",
                zIndex: 0
              }}
            />

            <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Logo / Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "60px" }}>
                <div>
                  <h1 style={{ fontSize: "48px", fontWeight: "300", margin: 0, letterSpacing: "-0.04em" }}>Ratio x</h1>
                  <p style={{ fontSize: "16px", color: "rgba(244, 241, 237, 0.5)", marginTop: "8px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Risk & Allocation Overview
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "64px", fontWeight: "300", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {data.healthScore.toFixed(0)}<span style={{ fontSize: "24px", color: "rgba(244, 241, 237, 0.3)" }}>/100</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "rgba(245, 166, 35, 0.8)", marginTop: "8px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Health</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: "100%", height: "12px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", marginBottom: "80px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    width: `${data.healthScore}%`, 
                    height: "100%", 
                    background: "#f5a623", 
                    borderRadius: "6px",
                    boxShadow: "0 0 20px rgba(245, 166, 35, 0.3)"
                  }} 
                />
              </div>

              {/* Main Stats Grid */}
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: aspectRatio === "square" ? "1fr" : "1fr 1fr", 
                  gap: "60px",
                  marginBottom: aspectRatio === "square" ? "80px" : "60px"
                }}
              >
                {/* Core Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                  <div>
                    <p style={{ fontSize: "14px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gross Exposure</p>
                    <p style={{ fontSize: "36px", fontWeight: "300", color: "#f4f1ed", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
                      ₹{data.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Capital Deployed</p>
                    <p style={{ fontSize: "36px", fontWeight: "300", color: "#f4f1ed", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
                      ₹{data.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div style={{ gridColumn: "span 2", marginTop: "20px" }}>
                    <p style={{ fontSize: "14px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Absolute Return</p>
                    <p style={{ fontSize: "48px", fontWeight: "300", color: "#f4f1ed", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
                      {data.pnl >= 0 ? "+" : "-"}₹{Math.abs(data.pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      <span style={{ fontSize: "24px", marginLeft: "16px", opacity: 0.6, fontWeight: "300" }}>
                        ({data.pnlPct >= 0 ? "+" : ""}{data.pnlPct.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Asset Allocation */}
                <div>
                  <p style={{ fontSize: "14px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "28px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Class Allocation Matrix</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {data.driftResults.map(row => (
                      <div key={row.assetClass}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "flex-end" }}>
                          <span style={{ fontSize: "16px", color: "#f4f1ed", fontFamily: "'Outfit', sans-serif" }}>{row.assetClass}</span>
                          <span style={{ fontSize: "16px", fontWeight: "400", color: "#f5a623", fontFamily: "'JetBrains Mono', monospace" }}>{row.currentPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "2px" }}>
                          <div 
                            style={{ 
                              width: `${row.currentPct}%`, 
                              height: "100%", 
                              background: row.currentPct > 0 ? "#f5a623" : "transparent",
                              borderRadius: "2px"
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                    {data.driftResults.length === 0 && (
                      <p style={{ fontSize: "14px", color: "rgba(244, 241, 237, 0.3)", fontStyle: "italic", fontFamily: "'Outfit', sans-serif" }}>No allocation data</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub Info */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "40px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "60px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Positions</p>
                    <p style={{ fontSize: "24px", color: "#f4f1ed", fontWeight: "400", fontFamily: "'JetBrains Mono', monospace" }}>
                      {data.holdingsCount} active
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Analysis</p>
                    <p style={{ fontSize: "24px", color: "#f4f1ed", fontWeight: "400", fontFamily: "'JetBrains Mono', monospace" }}>
                      {data.lastRebalanced 
                        ? format(new Date(data.lastRebalanced), "MMM d, yyyy") 
                        : "Pending"}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right", borderLeft: "1px solid rgba(255, 255, 255, 0.1)", paddingLeft: "40px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(244, 241, 237, 0.4)", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Generated via</p>
                  <p style={{ fontSize: "24px", fontWeight: "300", letterSpacing: "-0.01em", color: "#f5a623", margin: 0 }}>ratio-x.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
