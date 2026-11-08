import React from "react";
import { Link } from "react-router-dom";
import { DriftResult } from "@/lib/drift-engine";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Layers, Plus, FileSpreadsheet } from "lucide-react";

interface DriftTableProps {
  driftResults: DriftResult[];
  setRebalanceModalOpen: (open: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
  setImportCSVModalOpen: (open: boolean) => void;
}

const ASSET_COLORS: Record<string, string> = {
  "Large Cap Equity": "#3b82f6",
  "Mid Cap Equity": "#a855f7",
  "Small Cap Equity": "#f43f5e",
  "Debt": "#10b981",
  "Gold": "#f59e0b",
  "Hybrid": "#06b6d4",
  "Liquid": "#64748b",
};

const DriftTable: React.FC<DriftTableProps> = ({
  driftResults,
  setRebalanceModalOpen,
  setAddModalOpen,
  setImportCSVModalOpen,
}) => {
  if (driftResults.length === 0) {
    return (
      <div className="border border-[#1f1f1f] rounded-[10px] bg-[#0c0c0c] p-12 text-center mb-10 relative overflow-hidden shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber/10 border border-amber/30 text-amber flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl text-white font-semibold mb-2">Portfolio Unallocated</h3>
          <p className="text-xs text-[#888] font-body leading-relaxed mb-6">
            No holdings or target allocations detected. Ingest your portfolio via broker CSV or enter positions manually to initialize drift tracking.
          </p>
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="text-xs uppercase tracking-wider font-mono bg-amber text-black font-bold px-5 py-2.5 rounded-[4px] hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" /> Manual Entry
            </button>
            <button
              onClick={() => setImportCSVModalOpen(true)}
              className="text-xs uppercase tracking-wider font-mono border border-[#2a2a2a] bg-[#141414] text-white px-5 py-2.5 rounded-[4px] hover:bg-[#1f1f1f] transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#888]" /> Import CAS / CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate allocation breakdown bar
  const totalActual = driftResults.reduce((acc, r) => acc + r.currentPct, 0) || 100;

  return (
    <div className="border border-[#1f1f1f] rounded-[10px] bg-[#0a0a0a] mb-10 relative overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#1f1f1f] bg-[#0d0d0d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-semibold">
              Drift Analysis Engine
            </h3>
          </div>
          <Link
            to="/learn-drift"
            className="text-[10px] uppercase tracking-wider font-mono text-[#888] hover:text-amber border border-[#222] bg-[#141414] hover:bg-[#1a1a1a] px-2.5 py-1 rounded transition-colors"
          >
            Formula Specs ↗
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRebalanceModalOpen(true)}
            className="text-xs uppercase tracking-wider font-mono bg-amber text-black font-bold px-4 py-2 rounded-[4px] hover:brightness-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
          >
            Compute Rebalance Orders
          </button>
        </div>
      </div>

      {/* Proportional Asset Allocation Bar */}
      <div className="px-6 pt-5 pb-3 border-b border-[#181818] bg-[#0b0b0b]">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#777] mb-2 tracking-wider">
          <span>Actual Portfolio Distribution</span>
          <span>Normalized Exposure: 100%</span>
        </div>
        <div className="w-full h-3 bg-[#161616] rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {driftResults.map((r) => {
            const width = Math.max(0, (r.currentPct / totalActual) * 100);
            if (width <= 0) return null;
            const color = ASSET_COLORS[r.assetClass] || "#f59e0b";
            return (
              <div
                key={r.assetClass}
                style={{ width: `${width}%`, backgroundColor: color }}
                className="h-full rounded-sm transition-all duration-500 hover:opacity-80"
                title={`${r.assetClass}: ${r.currentPct.toFixed(1)}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[1.8fr_100px_100px_120px_1.2fr_130px] text-[10px] uppercase tracking-wider text-[#777] font-mono px-6 py-3 bg-[#0d0d0d] border-b border-[#191919]">
            <span>Asset Class</span>
            <span className="text-right">Target</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Variance</span>
            <span className="pl-6">Deviation Meter</span>
            <span className="text-center">Protocol State</span>
          </div>

          {driftResults.map((row) => {
            const isOver = row.drift > 0;
            const isCritical = row.status === "critical";
            const isDrifting = row.status === "drifting";
            const color = ASSET_COLORS[row.assetClass] || "#f59e0b";

            return (
              <div
                key={row.assetClass}
                className="grid grid-cols-[1.8fr_100px_100px_120px_1.2fr_130px] text-xs font-mono px-6 py-4 border-b border-[#141414] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* Asset Class Name + Dot */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <p className="text-sm font-sans font-medium text-white">
                      {row.assetClass}
                    </p>
                    <p className="text-[10px] text-[#666] font-mono">
                      Threshold ±{row.driftThreshold}%
                    </p>
                  </div>
                </div>

                {/* Target */}
                <span className="text-right text-xs font-mono text-[#888]">
                  {row.targetPct.toFixed(1)}%
                </span>

                {/* Actual */}
                <span className="text-right text-sm font-mono text-white font-medium">
                  {row.currentPct.toFixed(1)}%
                </span>

                {/* Variance Chip */}
                <div className="flex justify-end">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded ${
                      isCritical
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : isDrifting
                        ? "bg-amber/10 text-amber border border-amber/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {isOver ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : row.drift < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    {row.drift > 0 ? "+" : ""}
                    {row.drift.toFixed(1)}%
                  </span>
                </div>

                {/* Visual Comparative Deviation Meter */}
                <div className="pl-6">
                  <div className="relative w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCritical
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                          : isDrifting
                          ? "bg-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                          : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      }`}
                      style={{
                        width: `${Math.min(
                          (Math.abs(row.drift) / row.driftThreshold) * 50,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#555] font-mono mt-1">
                    <span>0%</span>
                    <span>Target Pin</span>
                    <span>Alert Pin</span>
                  </div>
                </div>

                {/* Status State Badge */}
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-[3px] border ${
                      isCritical
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold"
                        : isDrifting
                        ? "bg-amber/15 text-amber border-amber/30 font-medium"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium"
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    {isCritical ? "Critical Drift" : isDrifting ? "Drifting" : "Balanced"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriftTable;
