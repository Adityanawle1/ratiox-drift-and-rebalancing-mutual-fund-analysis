import { useScrollReveal } from "./useScrollReveal";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const EarlyAccess = () => {
  const { ref, visible } = useScrollReveal(0.15);
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard/fee-audit" : "/signup";

  return (
    <section id="early-access" className="py-16 md:py-20 border-t border-surface-border bg-background relative overflow-hidden" ref={ref}>
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber/5 via-background to-background opacity-50 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div
          className={`relative overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border border-surface-border/50 bg-card/40 backdrop-premium glass shadow-premium rounded-[16px] card-hover-glow transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Internal corner glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="text-center md:text-left md:max-w-xl relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight heading-premium">
              Stop overpaying. <span className="gradient-text-amber glow-text whitespace-nowrap">Start auditing.</span>
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground text-premium">
              No credit card required. See your mutual fund's real cost in under 5 minutes. Free forever.
            </p>
          </div>
          
          <div className="mt-8 md:mt-0 relative z-10 shrink-0 w-full md:w-auto">
            <Link
              to={ctaHref}
              className="group relative flex w-full md:w-auto items-center justify-center overflow-hidden bg-amber text-background font-mono uppercase tracking-widest text-xs font-bold px-8 py-4 transition-all duration-300 rounded-[6px] hover:shadow-glow-amber hover-lift hover:brightness-110"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {user ? "Go to Dashboard" : "Audit My Funds"}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                  <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default EarlyAccess;
