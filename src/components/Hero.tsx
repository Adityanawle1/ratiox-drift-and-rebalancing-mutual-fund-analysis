import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import SocialProof from "./SocialProof";
import Magnetic from "./Magnetic";
import SupportedBrokers from "./SupportedBrokers";

/**
 * Hero Component
 * Renders the primary landing page hero section including animated copy,
 * dynamic call-to-action buttons, and the interactive dashboard mockup.
 */
const Hero = () => {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard/fee-audit" : "/signup";
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const rotatingWords = [
    "bleeding hidden fees.", 
    "overpaying its TER.", 
    "leaking to commissions.", 
    "losing ₹ lakhs silently."
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    // Rotate words
    const wordInterval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % rotatingWords.length);
    }, 2800);

    return () => {
      clearInterval(wordInterval);
    };
  }, [rotatingWords.length]);

  return (
    <section className="relative min-h-[85vh] bg-black border-b border-surface-border overflow-hidden">
      
      {/* Abstract background — subtle gradient mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial gradient core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_rgba(232,137,12,0.06)_0%,_transparent_60%)]" />
        {/* Secondary accent */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(30,60,100,0.05)_0%,_transparent_60%)]" />
        {/* Noise/grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20baseFrequency%3D%220.9%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22/%3E%3C/svg%3E')]" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-[85vh] flex items-center pb-12 pt-20 md:pb-16 md:pt-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center lg:items-start">
            
            {/* Left: Copy */}
            <div className="w-full">
              
              {/* Eyebrow Text */}
              <div className={`transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-[1px] bg-amber/50"></div>
                  <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    Mutual Fund & Portfolio Intelligence
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <div className={`transition-all duration-700 delay-100 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.15] mb-6 tracking-tight">
                  <span className="block opacity-95 mb-1">Your mutual fund is</span>
                  <span className="block relative text-[#E8890C]">
                    {/* Ghost element to reserve exact height for the longest text and prevent layout shifting */}
                    <span className="invisible block pointer-events-none" aria-hidden="true">
                      losing ₹ lakhs silently.
                    </span>
                    <span 
                      key={currentWord}
                      className="absolute inset-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                      {rotatingWords[currentWord]}
                    </span>
                  </span>
                </h1>

                {/* Subheading */}
                <div className="mb-8 md:mb-10 mt-6">
                  <h2 className="font-body text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                    Discover the <span className="text-white border-b border-white/20 pb-0.5">real cost</span> of your mutual funds and optimize your asset allocation in minutes.
                  </h2>
                </div>
              </div>

              {/* Description (Bullet Points) */}
              <div className={`transition-all duration-700 delay-200 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <ul className="font-body text-sm text-muted-foreground/90 max-w-lg mb-10 space-y-3">
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Uncover hidden TERs and Regular vs. Direct plan gaps.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Track portfolio drift and asset allocation shifts over time.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Visualize hypothetical rebalancing scenarios instantly.</span>
                  </li>
                </ul>
              </div>

                {/* CTA Section */}
              <div className={`transition-all duration-700 delay-300 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
                    <Magnetic strength={20}>
                      <Link
                        to={ctaHref}
                        className="group relative overflow-hidden bg-foreground text-background font-body text-sm font-semibold px-8 py-4 hover:shadow-[0_0_30px_rgba(232,147,16,0.2)] transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
                      >
                        <div className="absolute inset-0 bg-amber transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                        <span className="relative z-10 group-hover:text-background transition-colors whitespace-nowrap">
                          {user ? "Go to Dashboard" : "Audit My Portfolio"}
                        </span>
                        <svg className="relative z-10 w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </Magnetic>

                    <Link
                      to="/learn-drift"
                      className="group flex items-center justify-center gap-3 font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 px-6 py-4 border border-surface-border hover:border-amber/40 hover:bg-amber/5 rounded-sm bg-surface/30 backdrop-blur-sm w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4 text-amber group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="whitespace-nowrap">See How It Works</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-body pl-2">
                    <div className="w-1.5 h-1.5 bg-drift-green rounded-full animate-pulse"></div>
                    <span>Free forever · No credit card required</span>
                  </div>
                </div>

                {/* Scroll hint */}
                <div 
                  onClick={() => document.getElementById('fee-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-5 text-xs font-body text-amber/80 cursor-pointer flex items-center gap-1.5 w-max hover:text-amber transition-colors"
                >
                  Calculate your hidden fee loss right now <span className="animate-bounce inline-block">↓</span>
                </div>

                {/* Social Proof — below CTA */}
                <div className="mt-10">
                  <SocialProof />
                  <SupportedBrokers />
                </div>
              </div>
            </div>

            {/* Right: Product Mockup — Fee Audit focused */}
            <div className={`transition-all duration-1000 delay-500 ease-out lg:mt-6 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              <div className="relative">
                {/* Glow behind mockup */}
                <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_rgba(232,137,12,0.15)_0%,_transparent_60%)] pointer-events-none blur-xl" />
                
                {/* Dashboard Card */}
                <div className="border border-surface-border bg-card/80 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  {/* Title bar */}
                  <div className="border-b border-surface-border px-6 py-4 bg-surface/30 flex flex-col gap-1">
                    <h3 className="font-display text-lg text-foreground tracking-tight">Your Fee Audit</h3>
                    <p className="text-xs text-muted-foreground font-body">Analysis of hidden charges in your portfolio</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Fee Score */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground font-body block mb-1">Total Fee Drag</span>
                        <span className="font-display text-4xl font-light text-drift-red">₹3.2L<span className="text-base text-muted-foreground/50"> lost</span></span>
                      </div>
                      <span className="font-mono text-xs text-drift-red bg-drift-red/10 border border-drift-red/20 px-2.5 py-1 rounded-sm">High Cost</span>
                    </div>

                    {/* Diverging Graph Animation */}
                    <div className="border-t border-surface-border pt-5 pb-1 relative h-32 w-full overflow-hidden">
                      <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground absolute top-4 left-0">Growth Trajectory</span>
                      
                      {/* X and Y axis subtle lines */}
                      <div className="absolute bottom-2 left-0 w-full h-[1px] bg-surface-border"></div>
                      <div className="absolute top-8 bottom-2 left-0 w-[1px] bg-surface-border"></div>
                      
                      {/* Returns WITHOUT fees (Green line going up) */}
                      <svg className="absolute bottom-2 left-0 w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                         {/* Path for ideal returns */}
                         <path d="M 0 100 Q 40 80, 100 10" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "dash 3s ease-out forwards" }} />
                         {/* Path for actual returns (diverging lower) */}
                         <path d="M 0 100 Q 50 85, 100 60" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "dash 3s ease-out forwards 0.5s" }} />
                         
                         {/* Shaded area representing the loss */}
                         <path d="M 0 100 Q 40 80, 100 10 L 100 60 Q 50 85, 0 100 Z" fill="rgba(239, 68, 68, 0.1)" className="opacity-0" style={{ animation: "fade-in-up 1s ease-out forwards 1.5s" }} />
                      </svg>
                      
                      {/* Labels */}
                      <div className="absolute top-8 right-2 text-[8px] font-mono text-drift-green flex items-center gap-1 opacity-0" style={{ animation: "fade-in-up 0.5s ease-out forwards 2s" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-drift-green"></div> Ideal Return
                      </div>
                      <div className="absolute top-16 right-2 text-[8px] font-mono text-drift-red flex items-center gap-1 opacity-0" style={{ animation: "fade-in-up 0.5s ease-out forwards 2.5s" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-drift-red"></div> After Fees
                      </div>
                    </div>

                    {/* Fund Fee Breakdown */}
                    <div className="border-t border-surface-border pt-5 space-y-3">
                      <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Fund Expense Analysis</span>
                      {[
                        { name: "HDFC Mid-Cap Opp", ter: "1.74%", directTer: "0.81%", saving: "₹48K", status: "drift-red" },
                        { name: "SBI Blue Chip", ter: "1.52%", directTer: "0.72%", saving: "₹36K", status: "drift-red" },
                        { name: "Parag Parikh Flexi", ter: "0.63%", directTer: "0.63%", saving: "—", status: "drift-green" },
                        { name: "ICICI Pru Equity", ter: "1.81%", directTer: "1.05%", saving: "₹31K", status: "amber" },
                        { name: "Nippon Small Cap", ter: "1.62%", directTer: "0.68%", saving: "₹52K", status: "drift-red" },
                      ].map((fund, i) => (
                        <div key={i} className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${fund.status} shrink-0`} />
                          <span className="text-[10px] sm:text-xs font-body text-foreground truncate flex-1">{fund.name}</span>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">{fund.ter}</span>
                            <span className="text-[8px] text-muted-foreground">→</span>
                            <span className="font-mono text-[9px] sm:text-[10px] text-drift-green">{fund.directTer}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Savings Summary */}
                    <div className="border-t border-surface-border pt-5">
                      <div className="flex items-center justify-between bg-amber/5 border border-amber/15 px-4 py-3 rounded-sm">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-body block">Estimated Savings (Direct Switch)</span>
                          <span className="font-mono text-lg text-amber font-semibold">₹1,67,000</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-body">over 10 years</span>
                      </div>
                    </div>

                    {/* Bottom action */}
                    <div className="flex gap-3">
                      <Link 
                        to={user ? "/dashboard/fee-audit" : "/signup"}
                        className="flex-1 bg-amber text-background font-body text-xs font-semibold text-center py-2.5 rounded-sm hover:brightness-110 transition-all cursor-pointer"
                      >
                        Full Fee Audit
                      </Link>
                      <Link 
                        to={user ? "/dashboard?rebalance=true" : "/signup"}
                        className="flex-1 bg-surface border border-surface-border text-foreground font-body text-xs text-center py-2.5 rounded-sm hover:border-white/10 transition-colors cursor-pointer"
                      >
                        Rebalance
                      </Link>
                    </div>
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

export default Hero;