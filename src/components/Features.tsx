import { useScrollReveal } from "./useScrollReveal";

const feeTransparency = [
  { id: "01", title: "Hidden Charge Detector", copy: "See beyond the stated TER. GST on management fees, stamp duty, STT, and transaction charges — the full picture of what your mutual fund actually costs.", icon: "⊘" },
  { id: "02", title: "Regular vs Direct Savings", copy: "Quantify how much the regular-to-direct TER gap compounds over time. Per fund and across your entire portfolio — this is where the real money leaks.", icon: "⊿" },
  { id: "03", title: "10-Year Cost Projector", copy: "Visualize fee drag compounding over your investment horizon. See when cumulative fees exceed your total invested amount.", icon: "◉" },
  { id: "04", title: "Exit Load Timing", copy: "Track exit load windows per holding. Know exactly when each fund becomes free to redeem without penalty.", icon: "⏱" },
];

const portfolioIntelligence = [
  { id: "05", title: "Real-Time Drift Detection", copy: "Monitor allocation vs target dynamically. Flags trigger upon breaching absolute or relative variance thresholds you define.", icon: "◎" },
  { id: "06", title: "Health Score 0–100", copy: "A single composite metric quantifying your portfolio's alignment with target allocations. Updated with every price tick.", icon: "◈" },
  { id: "07", title: "Rebalance Engine", copy: "View the SELL + BUY adjustments needed to restore your target baseline. Scenario-based insights — no spreadsheets required.", icon: "⇋" },
  { id: "08", title: "Tax Harvesting", copy: "Surface hypothetical tax-loss harvesting and LTCG exemption scenarios across your holdings. Educational analysis only.", icon: "◇" },
];

const Features = () => {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="features" className="py-16 md:py-32 border-t border-surface-border bg-background" ref={ref}>
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        
        {/* Header Label */}
        <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you get
          </span>
        </div>

        <h2
          className={`font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground mb-12 md:mb-16 transition-all duration-700 leading-tight tracking-tight max-w-2xl ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          Expose every hidden cost. <br/> Keep your portfolio sharp.
        </h2>

        {/* Category 1: Fee Transparency — NOW FIRST */}
        <div className={`mb-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "150ms" }}>
          <span className="inline-flex items-center gap-2 text-xs font-body font-semibold text-amber/80 bg-amber/5 border border-amber/10 px-3 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 bg-amber rounded-full" />
            Mutual Fund Fee Transparency
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-surface-border mb-12">
          {feeTransparency.map((f, i) => (
            <div
              key={f.id}
              className={`relative bg-background p-6 md:p-8 lg:p-10 transition-all duration-500 hover:bg-surface/40 hover:-translate-y-1 hover:shadow-2xl hover:z-10 group cursor-default`}
              style={{ transitionDelay: `${i * 100 + 200}ms`, opacity: visible ? 1 : 0 }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative text-2xl opacity-30 group-hover:opacity-100 group-hover:text-amber transition-all duration-300">{f.icon}</span>
                </div>
                <div className="w-2 h-2 border border-surface-border group-hover:border-amber group-hover:bg-amber group-hover:shadow-[0_0_10px_rgba(232,147,16,0.5)] transition-all duration-300"></div>
              </div>
              <h3 className="font-display text-xl tracking-tight text-foreground mb-3 group-hover:text-amber transition-colors duration-300">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-body group-hover:text-muted-foreground/90 transition-colors">{f.copy}</p>
            </div>
          ))}
        </div>

        {/* Category 2: Portfolio Intelligence — NOW SECOND */}
        <div className={`mb-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "600ms" }}>
          <span className="inline-flex items-center gap-2 text-xs font-body font-semibold text-muted-foreground bg-surface/30 border border-surface-border px-3 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
            Portfolio Intelligence
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-surface-border">
          {portfolioIntelligence.map((f, i) => (
            <div
              key={f.id}
              className={`relative bg-background p-6 md:p-8 lg:p-10 transition-all duration-500 hover:bg-surface/40 hover:-translate-y-1 hover:shadow-2xl hover:z-10 group cursor-default`}
              style={{ transitionDelay: `${i * 100 + 700}ms`, opacity: visible ? 1 : 0 }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative text-2xl opacity-30 group-hover:opacity-100 group-hover:text-amber transition-all duration-300">{f.icon}</span>
                </div>
                <div className="w-2 h-2 border border-surface-border group-hover:border-amber group-hover:bg-amber group-hover:shadow-[0_0_10px_rgba(232,147,16,0.5)] transition-all duration-300"></div>
              </div>
              <h3 className="font-display text-xl tracking-tight text-foreground mb-3 group-hover:text-amber transition-colors duration-300">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-body group-hover:text-muted-foreground/90 transition-colors">{f.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
