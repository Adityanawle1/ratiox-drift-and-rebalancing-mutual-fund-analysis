import { useScrollReveal } from "./useScrollReveal";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DashboardPreview = () => {
  const { user } = useAuth();
  const { ref, visible } = useScrollReveal(0.15);
  const [feeSaved, setFeeSaved] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = 167;
    const duration = 1500;
    const incrementTime = Math.max(16, duration / end);
    const timer = setInterval(() => {
      start += 1;
      setFeeSaved(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [visible]);

  return (
    <section className="py-24 md:py-32 border-t border-surface-border bg-[#050505] relative overflow-hidden" ref={ref}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(232,137,12,0.03)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight tracking-tight">
              Every fee exposed.<br/><span className="text-amber">Every allocation</span><br/> perfectly balanced.
            </h2>
            <p className="text-base text-muted-foreground font-body leading-relaxed max-w-sm mb-8">
              The Ratio x dashboard gives you a complete fee audit, drift analysis, and smart rebalancing — all in one clean view.
            </p>
            <ul className="space-y-3 font-body text-sm text-muted-foreground border-l-2 border-surface-border pl-4">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-drift-red rounded-full"></div> TER & hidden cost breakdown</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber rounded-full"></div> Regular vs Direct switch savings</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-drift-green rounded-full"></div> Portfolio health & drift tracking</li>
            </ul>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="border border-surface-border bg-card shadow-2xl relative overflow-hidden group max-w-sm mx-auto hover:shadow-[0_0_40px_rgba(232,147,16,0.08)] transition-shadow duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="border-b border-surface-border px-6 py-4 bg-surface/30 flex flex-col gap-1">
                <h3 className="font-display text-base text-foreground tracking-tight">Fee Audit Summary</h3>
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">Generated Report</p>
              </div>
              <div className="p-6 space-y-8">
                <div className="flex items-end justify-between">
                  <span className="text-xs text-muted-foreground font-body">Potential Savings</span>
                  <span className="font-display text-3xl font-light text-amber">₹{feeSaved > 0 ? `${(feeSaved / 100).toFixed(0)},${String(feeSaved % 100).padStart(2, '0')}0` : '0'}<span className="text-sm text-muted-foreground opacity-50">/yr</span></span>
                </div>

                {/* Fee gauge */}
                <div className="flex justify-center py-2 relative">
                  <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-24 h-12 bg-amber/20 blur-xl rounded-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}></div>
                  <svg width="180" height="100" viewBox="0 0 120 68" className="relative z-10">
                    <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="currentColor" className="text-surface-border" strokeWidth="3" strokeLinecap="round" />
                    <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="currentColor" className="text-drift-red drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" strokeWidth="3" strokeLinecap="round" strokeDasharray="157" strokeDashoffset="157"
                      style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)", strokeDashoffset: visible ? (157 - 157 * 0.73) : 157 }} />
                  </svg>
                </div>

                <div className="border-t border-surface-border pt-6 space-y-4">
                  <div className={`flex justify-between items-center transition-all duration-700 delay-[600ms] ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <span className="text-xs text-muted-foreground font-body">Avg. TER (Regular)</span>
                    <span className="font-mono text-xs text-drift-red">1.68%</span>
                  </div>
                  <div className={`flex justify-between items-center transition-all duration-700 delay-[800ms] ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <span className="text-xs text-muted-foreground font-body">Avg. TER (Direct)</span>
                    <span className="font-mono text-xs text-drift-green">0.78%</span>
                  </div>
                  <div className={`flex justify-between items-center transition-all duration-700 delay-[1000ms] ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <span className="text-xs text-muted-foreground font-body">Status</span>
                    <span className="font-mono text-xs text-background bg-drift-red px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-background rounded-full animate-pulse"></div>Overpaying
                    </span>
                  </div>
                </div>

                <div className={`pt-2 transition-all duration-700 delay-[1200ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  <Link 
                    to={user ? "/dashboard/fee-audit" : "/signup"}
                    className="w-full relative block group/btn overflow-hidden bg-surface border border-surface-border text-foreground font-body text-xs py-4 text-center transition-all duration-300 hover:border-amber/50 font-medium cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-amber transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
                    <span className="relative z-10 group-hover/btn:text-background transition-colors block">Run Full Fee Audit</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
