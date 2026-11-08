import React from "react";
import { format } from "date-fns";

interface RebalanceHistoryProps {
  rebalanceLogs: any[];
}

const RebalanceHistory: React.FC<RebalanceHistoryProps> = ({ rebalanceLogs }) => {
  if (rebalanceLogs.length === 0) return null;

  return (
    <div className="mt-10 border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#0a0a0a] mb-10">
      <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <h3 className="text-sm font-semibold text-white">Rebalance History</h3>
      </div>
      {rebalanceLogs.map((log) => (
        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[#131313] last:border-b-0 hover:bg-white/[0.02] transition-colors gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <p className="text-[14px] font-medium text-white">
                {format(new Date(log.date), "dd MMM yyyy")}
              </p>
              <span className="text-[11px] text-[#888] bg-[#161616] px-2 py-0.5 rounded font-medium">
                {log.status}
              </span>
            </div>
            <p className="text-[12px] text-[#777]">
              <span className="text-amber font-medium">{log.orders?.length || 0}</span> entries generated
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-3 sm:justify-end mb-1">
              <span className="font-mono text-[14px] text-[#888] tabular">{log.before_score}</span>
              <span className="text-[#555]">→</span>
              <span className="font-mono text-[14px] text-emerald-400 font-medium tabular">{log.after_score}</span>
            </div>
            <p className="text-[11px] text-[#666]">Health impact</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RebalanceHistory;
