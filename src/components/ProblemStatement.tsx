import { useScrollReveal } from "./useScrollReveal";
import { useEffect, useState } from "react";

const stats = [
  { prefix: "₹", target: 3, suffix: ".2L+", label: "Average hidden fees paid by an Indian MF investor over 10 years on a ₹10K SIP." },
  { prefix: "", target: 92, suffix: "%", label: "Of regular plan investors don't know they're paying 0.5–1.5% more than direct plans." },
  { prefix: "", target: 20, suffix: "%+", label: "Average portfolio drift over 3 years if left un-rebalanced, exposing you to hidden risks." },
];

const ProblemStatement = () => {
  const { ref, visible } = useScrollReveal(0.15);
  const [counts, setCounts] = useState([0, 0, 100]); // Third one counts down to 0 for effect

  useEffect(() => {
    if (!visible) return;
    
    // Animate numbers
    const duration = 1500;
    const intervals = stats.map((stat, i) => {
      let start = i === 2 ? 100 : 0;
      const end = stat.target;
      const diff = Math.abs(end - start);
      if (diff === 0) return null;
      
      const stepTime = Math.max(20, duration / diff);
      
      return setInterval(() => {
        setCounts(prev => {
          const newCounts = [...prev];
          if (start < end) {
            newCounts[i] += 1;
            start += 1;
          } else {
            newCounts[i] -= 1;
            start -= 1;
          }
          return newCounts;
        });
        
        if (start === end) clearInterval(intervals[i]!);
      }, stepTime);
    });

    return () => intervals.forEach(i => i && clearInterval(i));
  }, [visible]);

  return (
    <section className="py-24 md:py-32 border-t border-surface-border bg-[#060606] relative overflow-hidden" ref={ref}>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Top dividing line that expands */}
        <div className="flex justify-center mb-16">
          <div className={`h-px bg-surface-border transition-all duration-1000 ease-out ${visible ? "w-full opacity-100" : "w-0 opacity-0"}`}></div>
        </div>

        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-border">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col py-8 md:py-0 md:px-12 group transition-all duration-700`}
              style={{ 
                transitionDelay: `${i * 150}ms`, 
                opacity: visible ? 1 : 0, 
                transform: visible ? "translateY(0)" : "translateY(20px)" 
              }}
            >
              {/* Header Label */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-amber transition-colors">
                  {["Hidden Cost", "Awareness Gap", "Portfolio Drift"][i]}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-drift-red' : 'bg-surface-border'}`}></div>
              </div>

              {/* Huge Data Value */}
              <div className="mb-4">
                <span className="font-display text-5xl md:text-6xl font-light text-foreground transition-colors group-hover:text-white">
                  {s.prefix}{counts[i]}{s.suffix}
                </span>
                {i === 1 && <span className="font-display text-4xl text-drift-red ml-1 opacity-80 animate-pulse">▼</span>}
              </div>

              {/* Explanatory Text */}
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom dividing line with glowing dot */}
        <div className="flex items-center justify-center mt-16 relative">
          <div className={`h-px bg-surface-border transition-all duration-1000 ease-out delay-500 absolute w-full ${visible ? "scale-x-100" : "scale-x-0"}`}></div>
          <div className={`px-6 py-2 bg-[#060606] border border-surface-border z-10 transition-all duration-1000 delay-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="font-body text-xs text-foreground flex items-center gap-3 font-medium">
              <span className="w-2 h-2 rounded-full border border-drift-red flex items-center justify-center animate-pulse">
                <span className="w-1 h-1 bg-drift-red rounded-full"></span>
              </span>
              Fees are silent. Drift is invisible. We fix both.
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default ProblemStatement;
