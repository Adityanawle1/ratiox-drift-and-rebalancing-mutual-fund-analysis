import React from "react";
import { format } from "date-fns";

interface RebalanceHistoryProps {
  rebalanceLogs: any[];
}

const RebalanceHistory: React.FC<RebalanceHistoryProps> = ({ rebalanceLogs }) => {
  if (rebalanceLogs.length === 0) return null;

  return (
    <div className="mt-12 border border-surface-border/50 rounded-[12px] overflow-hidden glass shadow-premium bg-card/40 card-hover-glow relative">
      <div className="px-6 py-5 border-b border-surface-border/50 bg-background/40 backdrop-blur-sm">
        <span className="text-sm uppercase tracking-widest font-mono font-bold text-foreground opacity-90 text-premium">Rebalance Ledger</span>
      </div>
      {rebalanceLogs.map((log) => (
        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-surface-border/50 last:border-b-0 hover:bg-surface-hover/20 transition-colors group gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <p className="text-base font-mono font-semibold text-foreground text-premium">
                {format(new Date(log.date), "dd MMM yyyy")}
              </p>
              <span className="text-[10px] uppercase tracking-wider font-mono bg-surface-border/40 text-muted-foreground px-2 py-1 rounded-[4px] border border-surface-border/50 group-hover:border-surface-border/80 transition-colors">
                {log.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/80 font-mono tracking-tight">
              <span className="text-amber font-medium">{log.orders?.length || 0}</span> ANALYSIS ENTRIES GENERATED
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-4 sm:justify-end mb-2">
              <span className="font-mono text-base text-muted-foreground opacity-70">{log.before_score}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-border">
                <path d="M4 12h16M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-mono text-base text-drift-green font-semibold drop-shadow-sm">{log.after_score}</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono sm:text-right border-t border-surface-border/30 pt-1.5 mt-1.5">Health Impact</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RebalanceHistory;
