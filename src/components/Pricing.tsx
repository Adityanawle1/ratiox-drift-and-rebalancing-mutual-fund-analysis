import { useScrollReveal } from "./useScrollReveal";
import { Link } from "react-router-dom";
import Magnetic from "./Magnetic";

const Pricing = () => {
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <section id="pricing" className="py-16 md:py-32 border-t border-surface-border bg-[#060606] relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(232,137,12,0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-5 md:px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            <div className="w-8 h-[1px] bg-muted-foreground/30" />
            Pricing
            <div className="w-8 h-[1px] bg-muted-foreground/30" />
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-foreground tracking-tight leading-tight mb-4">
            Free to audit. <br />
            <span className="text-muted-foreground">Pro when you're ready.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div
            className={`border border-surface-border bg-card/50 p-6 md:p-10 transition-all duration-700 hover:border-white/10 group ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">Free</span>
              <span className="font-mono text-xs text-drift-green bg-drift-green/10 border border-drift-green/20 px-2 py-0.5 rounded-sm">Active</span>
            </div>
            <div className="mb-8">
              <span className="font-display text-4xl md:text-5xl font-light text-foreground">₹0</span>
              <span className="text-sm text-muted-foreground font-body ml-2">forever</span>
            </div>
            <ul className="space-y-3 mb-10">
              {[
                "Mutual fund fee audit & TER breakdown",
                "Regular vs Direct plan comparison",
                "10-year fee compounding projector",
                "Drift detection & health score",
                "Up to 20 holdings",
                "CSV import from brokers",
              ].map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground font-body flex items-start gap-3">
                  <svg className="w-4 h-4 text-drift-green shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Magnetic strength={20}>
              <Link
                to="/signup"
                className="block w-full text-center bg-amber text-background font-body text-sm font-semibold px-6 py-3.5 rounded-sm hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(232,147,16,0.3)] hover:shadow-[0_0_30px_rgba(232,147,16,0.5)]"
              >
                Audit my funds free
              </Link>
            </Magnetic>
          </div>

          {/* Pro Tier */}
          <div
            className={`border border-amber/20 bg-card/20 backdrop-blur-md p-6 md:p-10 relative overflow-hidden transition-all duration-700 group hover:border-amber/40 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-amber">Pro</span>
              <span className="font-mono text-xs text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded-sm">Coming soon</span>
            </div>
            <div className="mb-8">
              <span className="font-display text-4xl md:text-5xl font-light text-foreground">₹299</span>
              <span className="text-sm text-muted-foreground font-body ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-10">
              {[
                "Everything in Free",
                "Unlimited holdings & portfolios",
                "Hidden cost deep-dive (GST, STT, stamp duty)",
                "Tax-loss harvesting scenarios",
                "Rebalance scenario analysis",
                "Exit load calendar & alerts",
                "Priority support",
              ].map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground font-body flex items-start gap-3">
                  <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button
              className="block w-full text-center border border-amber/30 text-amber font-body text-sm font-semibold px-6 py-3.5 rounded-sm hover:bg-amber/10 transition-all duration-300 cursor-not-allowed opacity-70"
              disabled
            >
              Notify me when available
            </button>
          </div>
        </div>

        <p className={`text-center text-xs text-muted-foreground/60 font-body mt-8 transition-all duration-700 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}>
          No credit card required. Upgrade or cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
