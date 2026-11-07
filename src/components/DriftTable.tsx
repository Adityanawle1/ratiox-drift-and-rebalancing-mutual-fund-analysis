import React from "react";
import { Link } from "react-router-dom";
import { DriftResult } from "@/lib/drift-engine";

const statusColor = { healthy: "text-drift-green", drifting: "text-amber", critical: "text-drift-red" };
const statusBg = { healthy: "bg-drift-green", drifting: "bg-amber", critical: "bg-drift-red" };
const statusLabel = { healthy: "On Target", drifting: "Drifting", critical: "Critical" };

interface DriftTableProps {
  driftResults: DriftResult[];
  setRebalanceModalOpen: (open: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
  setImportCSVModalOpen: (open: boolean) => void;
}

const DriftTable: React.FC<DriftTableProps> = ({
  driftResults,
  setRebalanceModalOpen,
  setAddModalOpen,
  setImportCSVModalOpen
}) => {
  if (driftResults.length === 0) {
    return (
      <div className="border border-surface-border/50 rounded-[12px] bg-card/40 glass p-12 text-center mb-12 relative overflow-hidden shadow-premium card-hover-glow">
        <div className="absolute inset-0 bg-background/40 z-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="w-full h-px bg-amber shadow-glow-amber rotate-45 transform origin-center translate-y-[200px]" />
           <div className="w-full h-px bg-amber shadow-glow-amber -rotate-45 transform origin-center -translate-y-[200px]" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono mb-6 opacity-80">
            System empty. Awaiting data ingestion.
          </p>
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setAddModalOpen(true)}
              className="text-[11px] uppercase tracking-widest font-mono bg-amber text-background font-bold px-6 py-3 rounded-[4px] hover:brightness-110 hover:bg-amber/90 transition-all shadow-glow-amber hover-lift">
              Manual Entry
            </button>
            <button
              onClick={() => setImportCSVModalOpen(true)}
              className="text-[11px] uppercase tracking-widest font-mono border border-surface-border/50 bg-surface/50 text-foreground font-bold px-6 py-3 rounded-[4px] hover:bg-surface transition-all hover-lift glass">
              CSV Import
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-surface-border/50 rounded-[12px] glass shadow-premium bg-card/40 mb-12 relative overflow-hidden card-hover-glow">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/50 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-foreground opacity-90 text-premium">Drift Analysis Engine</span>
          <Link 
            to="/learn-drift" 
            className="text-[10px] uppercase tracking-wider font-mono border border-amber/30 bg-amber/10 hover:bg-amber/20 text-amber px-2.5 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </Link>
        </div>
        <button
          onClick={() => setRebalanceModalOpen(true)}
          className="text-[10px] uppercase tracking-wider font-mono bg-amber text-background font-bold px-4 py-2 rounded-[4px] hover:brightness-110 transition-all shadow-glow-amber hover-lift">
          View Analysis
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[1.5fr_70px_70px_80px_1fr] text-[11px] uppercase tracking-wider text-muted-foreground font-mono px-6 py-4 bg-surface/30 border-b border-surface-border/50">
            <span>Asset Class</span>
            <span className="text-right">Target</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Variance</span>
            <span className="pl-6">State</span>
          </div>
          {driftResults.map((row) => (
            <div key={row.assetClass} className="grid grid-cols-[1.5fr_70px_70px_80px_1fr] text-sm font-body px-6 py-5 border-b border-surface-border/50 last:border-b-0 hover:bg-surface/20 transition-colors">
              <span className="text-foreground text-premium font-medium">{row.assetClass}</span>
              <span className="text-right font-mono text-muted-foreground text-sm">{row.targetPct.toFixed(1)}%</span>
              <span className="text-right font-mono text-foreground text-sm font-medium">{row.currentPct.toFixed(1)}%</span>
              <span className={`text-right font-mono text-sm font-medium ${statusColor[row.status]}`}>
                {row.drift > 0 ? "+" : ""}{row.drift.toFixed(1)}%
              </span>
              <div className="pl-6 flex items-center gap-3">
                <div className="w-full max-w-[80px] h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusBg[row.status]} shadow-premium-sm`}
                    style={{ width: `${Math.min(Math.abs(row.drift) / row.driftThreshold * 100, 100)}%` }} />
                </div>
                <span className={`text-xs uppercase tracking-wider font-semibold whitespace-nowrap ${statusColor[row.status]}`}>
                  {statusLabel[row.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriftTable;
