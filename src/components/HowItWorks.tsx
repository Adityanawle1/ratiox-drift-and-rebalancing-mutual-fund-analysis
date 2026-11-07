import { useScrollReveal } from "./useScrollReveal";
import { useEffect, useState } from "react";

const steps = [
  { num: "01", title: "Add Your Funds", desc: "Enter your mutual fund holdings manually or import via CSV from Zerodha, Groww, Angel One. We pull TER data automatically." },
  { num: "02", title: "See the Real Cost", desc: "Instantly see hidden charges — TER breakdown, GST, stamp duty, regular vs direct gap, and 10-year compounded fee drag." },
  { num: "03", title: "Rebalance & Analyze", desc: "Explore educational insights: hypothetical rebalance scenarios, portfolio drift alerts, and regular vs direct comparisons to understand your allocation better." },
];

const HowItWorks = () => {
  const { ref, visible } = useScrollReveal(0.15);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section id="how-it-works" className="py-24 md:py-32 border-t border-surface-border bg-background overflow-hidden relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          <div className="max-w-xl">
            <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-16 transition-all duration-700 leading-[1.1] tracking-tight`} style={{ transitionDelay: "100ms" }}>
              Three steps to <br /><span className="text-foreground">fee transparency.</span>
            </h2>
            <div className="space-y-12 relative">
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-surface-border via-amber/20 to-surface-border hidden md:block" />
              {steps.map((s, i) => {
                const isActive = activeStep === i;
                return (
                  <div key={s.num} className="flex flex-col md:flex-row gap-6 relative transition-all duration-700 cursor-pointer group"
                    style={{ transitionDelay: `${i * 150 + 200}ms`, opacity: visible ? (isActive ? 1 : 0.4) : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
                    onClick={() => setActiveStep(i)}>
                    <div className="flex flex-col items-start md:items-center shrink-0 z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-sm font-medium transition-all duration-500 ${isActive ? 'bg-amber text-background shadow-[0_0_20px_rgba(232,147,16,0.3)]' : 'bg-surface border border-surface-border text-muted-foreground group-hover:text-foreground group-hover:border-white/15'}`}>{s.num}</div>
                    </div>
                    <div className="pt-2">
                      <h3 className={`font-display text-xl tracking-tight mb-2 transition-colors duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{s.title}</h3>
                      <p className="text-muted-foreground font-body leading-relaxed max-w-sm">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: UI Mockup */}
          <div className={`flex justify-center items-center h-full min-h-[500px] transition-all duration-1000 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full max-w-md aspect-[4/5] md:aspect-square bg-card border border-surface-border rounded-xl p-8 shadow-2xl flex flex-col justify-between overflow-hidden group hover:shadow-[0_0_40px_rgba(232,147,16,0.06)] transition-shadow duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="flex justify-between items-center border-b border-surface-border pb-6">
                <div className="flex flex-col gap-1"><div className="w-16 h-1.5 bg-surface-border rounded-full" /><div className="w-24 h-1.5 bg-surface-border rounded-full opacity-50" /></div>
                <div className="w-8 h-8 rounded-full border border-surface-border flex items-center justify-center"><div className="w-2 h-2 bg-amber rounded-full" /></div>
              </div>

              <div className="flex-1 flex flex-col justify-center relative">
                {/* Step 1: Fund Import */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${activeStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                  <div className="w-full space-y-3 px-4">
                    {["HDFC Mid-Cap Opp", "SBI Blue Chip", "Parag Parikh Flexi"].map((fund, i) => (
                      <div key={i} className="flex items-center gap-3 bg-surface/50 border border-surface-border px-3 py-2.5 rounded-sm">
                        <div className="w-6 h-6 rounded-full bg-surface-border flex items-center justify-center text-[8px] font-mono text-muted-foreground">MF</div>
                        <span className="text-xs font-body text-foreground flex-1">{fund}</span>
                        <svg className="w-3 h-3 text-drift-green" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Fee Analysis */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${activeStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                  <div className="space-y-4 w-full px-4">
                    {[{ label: "Regular TER", value: "1.74%", bar: 87, color: "bg-drift-red" }, { label: "Direct TER", value: "0.81%", bar: 40, color: "bg-drift-green" }, { label: "Hidden Costs", value: "0.42%", bar: 21, color: "bg-amber" }].map((item, i) => (
                      <div key={i} className="w-full">
                        <div className="flex justify-between mb-2"><span className="text-xs font-body text-muted-foreground">{item.label}</span><span className="text-xs font-mono text-foreground">{item.value}</span></div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden relative"><div className={`absolute top-0 bottom-0 left-0 ${item.color} transition-all duration-1000`} style={{ width: `${item.bar}%` }} /></div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-surface-border"><div className="flex justify-between items-center"><span className="text-xs font-body text-muted-foreground">You could save</span><span className="font-mono text-lg text-amber font-semibold">₹1.67L</span></div></div>
                  </div>
                </div>

                {/* Step 3: Optimize */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${activeStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                  <div className="w-full flex items-end justify-center gap-3 px-4 h-32">
                    {[40, 80, 30, 90, 60].map((h, i) => (
                      <div key={i} className="w-12 bg-surface rounded-t-sm relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                        <div className="w-full bg-surface-border transition-all duration-1000 origin-bottom" style={{ height: `${h}%` }} />
                        <div className="absolute w-full h-[1px] bg-amber top-[50%] z-10" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-surface-border w-full flex justify-between items-center px-4">
                    <div className="flex flex-col gap-1"><span className="text-xs font-body text-muted-foreground">Optimization</span><span className="font-mono text-sm text-foreground">3 Actions Found</span></div>
                    <div className="px-4 py-1.5 bg-foreground text-background font-body text-xs rounded-sm font-medium">Optimize</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
