import { useState } from "react";
import { useScrollReveal } from "./useScrollReveal";

const faqs = [
  { q: "What exactly does the fee audit show me?", a: "The fee audit breaks down every cost your mutual fund charges: the stated TER (Total Expense Ratio), GST on management fees, stamp duty, STT, transaction charges, and exit loads. We compare your regular plan TER vs direct plan TER and show how much the difference compounds over 5, 10, 20, and 30 years." },
  { q: "How is the Regular vs Direct savings calculated?", a: "We take the TER difference between your regular plan and the equivalent direct plan, then compound that difference over your investment horizon using your actual SIP amount. This shows the real rupee value you're losing to distributor commissions." },
  { q: "Is my portfolio data safe?", a: "Your data is encrypted end-to-end using enterprise-grade security. We use read-only data inputs — you manually enter your holdings. No broker credentials or trading passwords are ever stored." },
  { q: "How do I add my holdings?", a: "You can manually enter individual holdings or bulk import via CSV files from your broker statements (Zerodha, Groww, Angel One, etc.). All data entry is manual — we do not connect to any broker account." },
  { q: "Does Ratio x provide investment advice?", a: "No. Ratio x is a portfolio tracking and educational analysis tool only. We are not a SEBI-registered investment advisor, research analyst, or portfolio manager. All information is for your personal tracking and educational purposes. Always consult a qualified professional before making financial decisions." },
  { q: "Does Ratio x execute any trades?", a: "No. Ratio x has zero execution capability. We do not connect to any broker, trading platform, or exchange. Any scenario analysis shown is purely educational. You make all decisions independently through your own broker." },
  { q: "What about portfolio drift and rebalancing?", a: "In addition to fee auditing, Ratio x tracks portfolio drift (how far your allocations have moved from targets), provides rebalance scenario analysis, and surfaces tax-loss harvesting opportunities. These are secondary features that complement the core fee transparency engine." },
];

const FAQ = () => {
  const { ref, visible } = useScrollReveal(0.15);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 border-t border-surface-border bg-background" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">FAQ</span>
        </div>

        <h2
          className={`font-display text-4xl lg:text-5xl font-light text-foreground mb-16 transition-all duration-700 tracking-tight ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ filter: visible ? "blur(0px)" : "blur(4px)", transitionDelay: "100ms" }}
        >
          Common questions.
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`border border-surface-border bg-surface/10 transition-all duration-700 hover:bg-surface/20 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <button
                  className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <div className="flex gap-4 items-center">
                    <span className={`font-mono text-xs transition-colors ${isOpen ? 'text-amber' : 'text-muted-foreground/50'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={`font-display text-lg tracking-tight transition-colors ${isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{faq.q}</span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
                <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? "200px" : "0px", opacity: isOpen ? 1 : 0 }}>
                  <div className="p-6 pt-0 ml-[46px] border-l border-surface-border mt-0 pl-6">
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
