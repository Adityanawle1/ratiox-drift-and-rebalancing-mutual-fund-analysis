import React from "react";
import { Link } from "react-router-dom";
import { DriftResult } from "@/lib/drift-engine";
import { ArrowUpRight, ArrowDownRight, Plus, FileSpreadsheet, Layers } from "lucide-react";

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
      <div className="border border-[#1a1a1a] rounded-xl bg-[#0c0c0c] p-12 text-center mb-10">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber/10 text-amber flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl text-white font-semibold mb-2">No allocations yet</h3>
          <p className="text-sm text-[#888] leading-relaxed mb-6">
            Add your holdings or import a broker CSV to start tracking portfolio drift.
          </p>
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="text-[13px] font-medium bg-amber text-black px-5 py-2.5 rounded-md hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add position
            </button>
            <button
              onClick={() => setImportCSVModalOpen(true)}
              className="text-[13px] font-medium border border-[#2a2a2a] bg-[#141414] text-white px-5 py-2.5 rounded-md hover:bg-[#1f1f1f] transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#888]" /> Import CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalActual = driftResults.reduce((acc, r) => acc + r.currentPct, 0) || 100;

  return (
    <div className="border border-[#1a1a1a] rounded-xl bg-[#0a0a0a] mb-10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#0d0d0d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            Drift Analysis
          </h3>
          <Link
            to="/learn-drift"
            className="text-[11px] text-[#777] hover:text-amber transition-colors"
          >
            How it works →
          </Link>
        </div>

        <button
          onClick={() => setRebalanceModalOpen(true)}
          className="text-[13px] font-medium bg-amber text-black px-4 py-2 rounded-md hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          Rebalance
        </button>
      </div>

      {/* Allocation Bar */}
      <div className="px-6 pt-4 pb-3 border-b border-[#151515]">
        <div className="w-full h-2.5 bg-[#161616] rounded-full overflow-hidden flex gap-0.5 p-0.5">
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
        <div className="min-w-[650px]">
          <div className="grid grid-cols-[1.8fr_90px_90px_100px_1.2fr_110px] text-[11px] text-[#777] font-medium px-6 py-3 bg-[#0d0d0d] border-b border-[#171717]">
            <span>Asset class</span>
            <span className="text-right">Target</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Variance</span>
            <span className="pl-6">Deviation</span>
            <span className="text-center">Status</span>
          </div>

          {driftResults.map((row) => {
            const isOver = row.drift > 0;
            const isCritical = row.status === "critical";
            const isDrifting = row.status === "drifting";
            const color = ASSET_COLORS[row.assetClass] || "#f59e0b";

            return (
              <div
                key={row.assetClass}
                className="grid grid-cols-[1.8fr_90px_90px_100px_1.2fr_110px] text-sm px-6 py-4 border-b border-[#131313] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* Asset Class */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-white">{row.assetClass}</span>
                </div>

                {/* Target */}
                <span className="text-right text-[13px] font-mono text-[#888] tabular">
                  {row.targetPct.toFixed(1)}%
                </span>

                {/* Actual */}
                <span className="text-right text-[13px] font-mono text-white font-medium tabular">
                  {row.currentPct.toFixed(1)}%
                </span>

                {/* Variance */}
                <div className="flex justify-end">
                  <span
                    className={`inline-flex items-center gap-1 text-[12px] font-mono font-medium px-2 py-0.5 rounded tabular ${
                      isCritical
                        ? "bg-rose-500/10 text-rose-400"
                        : isDrifting
                        ? "bg-amber/10 text-amber"
                        : "bg-emerald-500/10 text-emerald-400"
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

                {/* Deviation Bar */}
                <div className="pl-6">
                  <div className="relative w-full h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCritical
                          ? "bg-rose-500"
                          : isDrifting
                          ? "bg-amber"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (Math.abs(row.drift) / row.driftThreshold) * 50,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      isCritical
                        ? "text-rose-400"
                        : isDrifting
                        ? "text-amber"
                        : "text-emerald-400"
                    }`}
                  >
                    {isCritical ? "Critical" : isDrifting ? "Drifting" : "Balanced"}
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
