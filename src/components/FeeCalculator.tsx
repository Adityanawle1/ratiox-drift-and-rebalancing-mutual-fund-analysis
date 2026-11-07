import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import { computeCorpus, estimateDirectTer, formatINR, generateYearlyBreakdown } from "@/lib/fee-calculator";

const FeeCalculator = () => {
  const { ref, visible } = useScrollReveal(0.05);

  // ─── Calculator Inputs ──────────────────────────────────────────
  const [monthlySIP, setMonthlySIP] = useState(10000);
  const [expenseRatio, setExpenseRatio] = useState(1.5);
  const [horizon, setHorizon] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  // ─── All Calculations (reactive) ────────────────────────────────
  const calculations = useMemo(() => {
    const grossRate = expectedReturn / 100;
    const netRate = grossRate - expenseRatio / 100;
    const directTer = estimateDirectTer(expenseRatio);
    const directRate = grossRate - directTer / 100;

    // Card 1 — Total fees paid
    const corpusWithoutFees = computeCorpus(monthlySIP, grossRate, horizon);
    const corpusWithFees = computeCorpus(monthlySIP, netRate, horizon);
    const totalFees = corpusWithoutFees - corpusWithFees;
    const totalInvested = monthlySIP * 12 * horizon;
    const feesExceedInvested = totalFees > totalInvested;

    // Card 3 — Regular vs Direct
    const corpusDirect = computeCorpus(monthlySIP, directRate, horizon);
    const switchSavings = corpusDirect - corpusWithFees;
    const monthsOfSIP = monthlySIP > 0 ? Math.round(switchSavings / monthlySIP) : 0;

    // Card 4 — Year breakdown
    const breakdown = generateYearlyBreakdown(monthlySIP, expectedReturn, expenseRatio, directTer, horizon);

    return {
      corpusWithoutFees,
      corpusWithFees,
      totalFees,
      totalInvested,
      feesExceedInvested,
      corpusDirect,
      switchSavings,
      monthsOfSIP,
      directTer,
      breakdown,
    };
  }, [monthlySIP, expenseRatio, horizon, expectedReturn]);

  return (
    <section
      id="fee-calculator"
      className="py-16 md:py-32 border-t border-surface-border bg-background relative overflow-hidden"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-6 relative z-10">

        {/* Header */}
        <div className={`mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Interactive Calculator
            </span>
          </div>

          {/* Header & Shock Stat */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-drift-red/10 border border-drift-red/20 text-drift-red mb-6">
              <span className="w-2 h-2 rounded-full bg-drift-red animate-pulse" />
              <span className="text-[10px] font-mono font-medium tracking-widest uppercase">Avg investor loses ₹3.2L in 10 years</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] tracking-tight max-w-3xl mb-6 mx-auto lg:mx-0">
              How much is your fund <br className="hidden lg:block" />
              <span className="text-amber">actually</span> costing you?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-body max-w-xl leading-relaxed mx-auto lg:mx-0">
              Most investors see the expense ratio. Nobody shows them what it compounds to. Calculate your exact loss below.
            </p>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className={`grid lg:grid-cols-[380px_1fr] gap-8 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* ─── INPUT PANEL ───────────────────────────────────── */}
          <div className="bg-card border border-surface-border rounded-[2px] p-6 lg:p-8 space-y-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 border border-amber bg-amber/20"></div>
              <span className="font-body text-xs font-semibold text-muted-foreground">Input Parameters</span>
            </div>

            {/* Monthly SIP */}
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1.5">Monthly SIP Amount (₹)</label>
              <input
                type="number"
                min={500}
                step={500}
                value={monthlySIP}
                onChange={e => setMonthlySIP(Math.max(0, Number(e.target.value)))}
                className="w-full bg-background/50 border border-surface-border rounded-sm px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber focus:bg-background transition-colors"
              />
            </div>

            {/* Expense Ratio */}
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1.5">Expense Ratio / TER (%)</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.01}
                value={expenseRatio}
                onChange={e => setExpenseRatio(Math.max(0, Math.min(5, Number(e.target.value))))}
                className="w-full bg-background/50 border border-surface-border rounded-sm px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber focus:bg-background transition-colors"
              />
              <p className="text-[10px] text-muted-foreground/60 font-body mt-1">Find this on your fund's factsheet or AMFI website</p>
            </div>

            {/* Investment Horizon */}
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1.5">
                Investment Horizon: <span className="font-mono text-amber">{horizon} years</span>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={horizon}
                onChange={e => setHorizon(Number(e.target.value))}
                className="w-full h-1 bg-surface-border rounded-full appearance-none cursor-pointer accent-amber [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50 mt-1">
                <span>1y</span><span>15y</span><span>30y</span>
              </div>
            </div>

            {/* Expected Return */}
            <div>
              <label className="block text-xs text-muted-foreground font-body mb-1.5">Expected Annual Return (%)</label>
              <input
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={expectedReturn}
                onChange={e => setExpectedReturn(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full bg-background/50 border border-surface-border rounded-sm px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber focus:bg-background transition-colors"
              />
              <p className="text-[10px] text-muted-foreground/60 font-body mt-1">Gross return before expenses</p>
            </div>
          </div>

          {/* ─── OUTPUT PANEL ──────────────────────────────────── */}
          <div className="space-y-4">

            {/* Card 1 — Total Fees Paid */}
            <div className="bg-card/80 backdrop-blur-sm border border-drift-red/30 shadow-[0_0_40px_rgba(239,68,68,0.08)] rounded-[2px] p-5 sm:p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-drift-red to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-3">Total Fees Paid Over {horizon} Years</p>
              <p className={`font-mono text-2xl sm:text-3xl md:text-4xl font-semibold ${calculations.feesExceedInvested ? "text-drift-red" : "text-amber"}`}>
                ₹{formatINR(calculations.totalFees)}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-2">paid in fees</p>
              {calculations.feesExceedInvested && (
                <p className="text-[10px] text-drift-red font-mono mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-drift-red animate-pulse"></span>
                  Fees exceed your total invested amount
                </p>
              )}
            </div>

            {/* Card 2 — Corpus Comparison */}
            <div className="bg-card border border-surface-border rounded-[2px] p-6">
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-4">What You Get vs What You Could Get</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground font-body mb-1">Your corpus (with fees)</p>
                  <p className="font-mono text-xl text-foreground">₹{formatINR(calculations.corpusWithFees)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-body mb-1">Without fees</p>
                  <p className="font-mono text-xl text-foreground">₹{formatINR(calculations.corpusWithoutFees)}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/50">
                <p className="text-xs font-body text-muted-foreground">
                  Difference: <span className="font-mono text-amber font-semibold">₹{formatINR(calculations.totalFees)}</span>
                </p>
              </div>
            </div>

            {/* Card 3 — Regular vs Direct */}
            <div className="bg-card border border-surface-border rounded-[2px] p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber/40 to-transparent"></div>
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-3">Regular vs Direct Plan</p>
              <p className="font-body text-sm text-foreground mb-1">Switching to Direct plan saves you:</p>
              <p className="font-mono text-xl sm:text-2xl md:text-3xl text-amber font-semibold">
                ₹{formatINR(calculations.switchSavings)}
                <span className="text-xs sm:text-sm text-muted-foreground font-body ml-1 sm:ml-2">over {horizon} years</span>
              </p>
              <p className="text-xs text-muted-foreground/80 font-body mt-3 border-l-2 border-amber/30 pl-3">
                That is <span className="text-amber font-mono font-semibold">{calculations.monthsOfSIP} months</span> of your SIP — for free.
              </p>
              <p className="text-[9px] text-muted-foreground/50 font-body mt-2">
                Assumes direct plan TER = {calculations.directTer.toFixed(2)}% (regular − 0.9%)
              </p>
            </div>

            {/* Card 4 — Year Breakdown */}
            <div className="bg-card border border-surface-border rounded-[2px] p-6">
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-4">The Real Cost Breakdown</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-surface-border">
                      <th className="text-left py-2 pr-4">Year</th>
                      <th className="text-right py-2 pr-4">Corpus (Regular)</th>
                      <th className="text-right py-2 pr-4">Corpus (Direct)</th>
                      <th className="text-right py-2">Fee Drag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.breakdown.map(row => (
                      <tr key={row.year} className="border-b border-surface-border/30 hover:bg-surface/20 transition-colors">
                        <td className="py-2.5 pr-4 text-muted-foreground">{row.year}</td>
                        <td className="py-2.5 pr-4 text-right text-foreground">₹{formatINR(row.corpusRegular)}</td>
                        <td className="py-2.5 pr-4 text-right text-foreground">₹{formatINR(row.corpusDirect)}</td>
                        <td className="py-2.5 text-right text-amber">₹{formatINR(row.feeDrag)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* CTA + Disclaimer */}
        <div className={`mt-12 text-center transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-amber text-background font-body text-sm font-semibold px-8 py-3.5 rounded-[2px] hover:brightness-110 transition-all shadow-glow-amber"
          >
            See your full portfolio fee audit
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-[10px] text-muted-foreground/50 font-body mt-4 max-w-md mx-auto">
            Calculations are illustrative. Actual returns vary. Consult your financial advisor before making decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeeCalculator;
