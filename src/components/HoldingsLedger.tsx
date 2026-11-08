import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { Database } from "@/lib/supabase";

type HoldingRow = Database['public']['Tables']['holdings']['Row'];

interface HoldingsLedgerProps {
  holdingsWithValues: HoldingWithValue[];
  holdings: HoldingRow[];
  setEditingHolding: (holding: HoldingRow | null) => void;
  handleDeleteHolding: (id: string) => void;
  deletingId: string | null;
  setImportCSVModalOpen: (open: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
}

const HoldingsLedger: React.FC<HoldingsLedgerProps> = ({
  holdingsWithValues,
  holdings,
  setEditingHolding,
  handleDeleteHolding,
  deletingId,
  setImportCSVModalOpen,
  setAddModalOpen
}) => {
  if (holdingsWithValues.length === 0) return null;

  return (
    <div className="border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#0a0a0a] mb-10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <h3 className="text-sm font-semibold text-white">Holdings</h3>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setImportCSVModalOpen(true)}
            className="text-[13px] font-medium border border-[#2a2a2a] bg-[#141414] text-[#aaa] hover:text-white hover:bg-[#1f1f1f] px-3.5 py-1.5 rounded-md transition-all"
          >
            Bulk CAS
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="text-[13px] font-medium bg-amber text-black px-4 py-1.5 rounded-md hover:brightness-110 transition-all"
          >
            + Add position
          </button>
        </div>
      </div>
      {holdingsWithValues.map((h: HoldingWithValue) => (
        <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[#131313] last:border-b-0 hover:bg-white/[0.02] transition-colors gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[14px] font-mono font-semibold text-white">{h.symbol}</span>
              <span className="text-[#444]">—</span>
              <p className="text-[13px] text-[#999] truncate max-w-[200px] sm:max-w-md">{h.name}</p>
              {!h.livePriceAvailable && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[11px] font-medium">
                  Stale price
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[11px] text-amber font-medium px-2 py-0.5 rounded bg-amber/10">
                {h.assetClass}
              </span>
              
              {(h.instrumentType === 'mf' || h.instrumentType === 'mutual_fund') && (
                <>
                  {h.planType?.toLowerCase() === 'regular' && (
                    <span className="text-[11px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-medium">
                      Regular plan
                    </span>
                  )}
                  {h.ter && h.ter >= 1.0 && (
                    <span className="text-[11px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-medium" title={`High TER: ${h.ter}%`}>
                      High cost ({h.ter}%)
                    </span>
                  )}
                </>
              )}
              
              <span className="text-[12px] font-mono text-[#888]">
                {h.quantity} <span className="text-[#555]">qty</span>
              </span>

              {h.cagr !== undefined ? (
                <span className={`text-[12px] font-mono font-medium ${h.cagr > 0 ? 'text-emerald-400' : h.cagr < 0 ? 'text-rose-400' : 'text-[#888]'}`}>
                  <span className="text-[#666] mr-1.5 text-[11px]">IRR</span>
                  {h.cagr > 0 ? '+' : ''}{h.cagr.toFixed(1)}%
                </span>
              ) : h.holdingPeriodDays !== undefined && h.holdingPeriodDays < 30 ? (
                <span className="text-[11px] text-amber/80 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                  Incubating ({30 - h.holdingPeriodDays}d left)
                </span>
              ) : null}

              {h.taxStatus && h.taxStatus !== 'unknown' && (
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  h.taxStatus === 'LTCG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber/10 text-amber'
                }`}>
                  {h.taxStatus}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right flex flex-col items-end">
              <p className="text-[14px] font-mono font-medium text-white tracking-tight tabular">
                ₹{h.marketValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-[11px] font-mono mt-1 ${h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                <span className="ml-1 opacity-70">
                  ({h.pnl >= 0 ? '+' : ''}{h.pnlPercent.toFixed(1)}%)
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                const originalHolding = holdings.find(hRow => hRow.id === h.id);
                if (originalHolding) setEditingHolding(originalHolding);
              }}
              className="text-[#555] hover:text-amber p-1.5 rounded transition-all"
              title="Edit position"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteHolding(h.id)}
              disabled={deletingId === h.id}
              className="text-[#555] hover:text-rose-400 p-1.5 rounded transition-all disabled:opacity-40"
              title="Remove"
            >
              {deletingId === h.id ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="animate-spin">
                  <circle cx="7" cy="7" r="5" strokeDasharray="20" strokeDashoffset="10" />
                </svg>
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HoldingsLedger;
