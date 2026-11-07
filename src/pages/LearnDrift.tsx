import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";
import Magnetic from "@/components/Magnetic";

const LearnDrift: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-body selection:bg-white selection:text-black">
      <Nav />

      <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-5 md:px-12 max-w-6xl mx-auto relative z-10">
        
        {/* Navigation Back */}
        <div className="mb-12 md:mb-20">
          <button 
            onClick={() => navigate("/")}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-white transition-colors"
          >
            [ ← Return to Index ]
          </button>
        </div>

        {/* Editorial Hero Section */}
        <header className="mb-16 md:mb-32 border-b border-[#222] pb-12 md:pb-20">
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] tracking-tighter leading-[0.95] text-white mb-10 md:mb-16">
            The Mechanics<br/>
            Of Wealth Decay.
          </h1>
          <div className="grid md:grid-cols-12 gap-8 md:gap-6">
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#666] mb-4">01 // The Thesis</p>
            </div>
            <div className="md:col-span-5">
              <p className="text-xl md:text-2xl leading-snug font-light text-[#d0d0d0]">
                Your portfolio is constantly being eroded by two silent forces: <span className="text-white underline decoration-[#444] underline-offset-4">Asset Allocation Drift</span> and <span className="text-white underline decoration-[#444] underline-offset-4">Compounding Fee Drift</span>.
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col justify-end">
              <p className="text-sm leading-relaxed text-[#888]">
                Failure to track and correct these movements results in unintentional risk exposure and catastrophic long-term capital loss. Most investors only realize this a decade too late.
              </p>
            </div>
          </div>
        </header>

        {/* Mechanism Section - Brutalist Grid */}
        <section className="mb-16 md:mb-32">
          <div className="grid md:grid-cols-2 border-t border-l border-[#222]">
            
            {/* Column A */}
            <div className="border-b md:border-r border-[#222] p-6 sm:p-8 md:p-12 lg:p-16 hover:bg-[#0a0a0a] transition-colors duration-500">
              <div className="flex justify-between items-start mb-12 md:mb-24">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#666]">Force A</h3>
                <span className="font-display text-4xl text-[#333]">01</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-8">The Compounding Trap (TER)</h2>
              <p className="text-[#999] leading-relaxed mb-6 font-light">
                Mutual fund fees are not a static charge. A <span className="text-white font-mono text-sm px-1 bg-[#222]">2.0%</span> expense ratio is deducted from your total asset value every year, regardless of performance. 
              </p>
              <p className="text-[#999] leading-relaxed mb-16 font-light">
                Because you lose the compounding interest on those deducted fees, a regular plan can consume up to 30% of your potential lifetime wealth compared to a low-cost direct plan.
              </p>
              
              {/* Typographic Data Viz */}
              <div className="border border-[#222] p-6 font-mono text-[9px] uppercase tracking-[0.1em] text-[#666]">
                <div className="flex justify-between mb-2"><span>Gross Returns (Direct)</span><span className="text-white">100%</span></div>
                <div className="w-full h-[1px] bg-[#222] mb-6"><div className="w-full h-full bg-white"></div></div>
                <div className="flex justify-between mb-2"><span>Net Returns (Regular)</span><span className="text-[#ffb84d]">~70%</span></div>
                <div className="w-full h-[1px] bg-[#222]"><div className="w-[70%] h-full bg-[#ffb84d]"></div></div>
              </div>
            </div>

            {/* Column B */}
            <div className="border-b md:border-r border-[#222] p-6 sm:p-8 md:p-12 lg:p-16 hover:bg-[#0a0a0a] transition-colors duration-500">
              <div className="flex justify-between items-start mb-12 md:mb-24">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#666]">Force B</h3>
                <span className="font-display text-4xl text-[#333]">02</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-8">Asset Allocation Drift</h2>
              <p className="text-[#999] leading-relaxed mb-6 font-light">
                Target allocations shift dynamically. If you target a <span className="text-white font-mono text-sm px-1 bg-[#222]">60/40</span> equity-debt split, and equities surge while debt remains stable, your portfolio drifts.
              </p>
              <p className="text-[#999] leading-relaxed mb-16 font-light">
                Your risk profile mutates without permission. A sudden market drawdown would now result in steeper, irrecoverable losses than your original architecture could sustain.
              </p>
              
              {/* Typographic Data Viz */}
              <div className="border border-[#222] p-6 font-mono text-[9px] uppercase tracking-[0.1em] text-[#666]">
                <div className="flex justify-between mb-2"><span>Target: 60E / 40D</span></div>
                <div className="flex w-full h-[1px] bg-[#222] mb-6">
                  <div className="w-[60%] h-full bg-white"></div>
                  <div className="w-[40%] h-full bg-[#444]"></div>
                </div>
                <div className="flex justify-between mb-2"><span>Actual: 75E / 25D</span><span className="text-[#ff4d4d]">Drift +15%</span></div>
                <div className="flex w-full h-[1px] bg-[#222]">
                  <div className="w-[75%] h-full bg-[#ff4d4d]"></div>
                  <div className="w-[25%] h-full bg-[#444]"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* The Solution */}
        <section className="mb-16 md:mb-32">
          <div className="border-b border-[#222] pb-6 mb-10 md:mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">The Architecture of Recovery.</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#666]">03 // Methodology</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-white bg-[#222] px-2 py-1">01. AUDIT</span>
              <p className="text-sm text-[#888] leading-relaxed pt-2">Calculate exact Total Expense Ratios and identify alpha-leaking Regular plans.</p>
            </div>
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-black bg-white px-2 py-1">02. SWITCH</span>
              <p className="text-sm text-[#888] leading-relaxed pt-2">Restructure into Direct plans to instantly strip commissions and restore compounding.</p>
            </div>
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-white bg-[#222] px-2 py-1">03. TRACK</span>
              <p className="text-sm text-[#888] leading-relaxed pt-2">Map exact percentage deviations from your target baseline allocation.</p>
            </div>
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-white bg-[#222] px-2 py-1">04. REBALANCE</span>
              <p className="text-sm text-[#888] leading-relaxed pt-2">Sell overweights and buy underweights to restore original risk tolerances.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center border-t border-[#222] pt-16 md:pt-24 pb-8 md:pb-12">
          <Magnetic strength={30}>
            <button 
              onClick={() => navigate("/dashboard/fee-audit")}
              className="bg-white text-black font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] font-bold px-8 sm:px-12 py-5 sm:py-6 hover:bg-[#e0e0e0] transition-colors border border-transparent hover:border-black w-full sm:w-auto"
            >
              [ Execute Portfolio Audit ]
            </button>
          </Magnetic>
        </div>

      </main>
    </div>
  );
};

export default LearnDrift;
