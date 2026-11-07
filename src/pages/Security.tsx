import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";

const Security = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-body selection:bg-white selection:text-black">
      <Nav />
      
      <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-5 md:px-8 max-w-5xl mx-auto relative z-10">
        
        {/* Navigation Back */}
        <div className="mb-12">
          <button 
            onClick={() => navigate("/")}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-white transition-colors"
          >
            [ ← Return to Index ]
          </button>
        </div>

        {/* Hero */}
        <header className="mb-16 md:mb-24">
          <p className="font-mono text-[10px] uppercase tracking-widest text-drift-green mb-6">Security & Trust</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-tighter leading-[1] text-white mb-8">
            Your Data Is Yours. <br />
            We Just Analyze It.
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed font-light text-[#d0d0d0] max-w-3xl">
            We built RatioX to give you financial clarity, not to become another data broker. We employ strict security measures to ensure your portfolio data remains private, encrypted, and entirely under your control.
          </p>
        </header>

        {/* Statements */}
        <div className="space-y-16 md:space-y-20 border-l border-[#222] pl-6 md:pl-10">
          
          {/* Statement 01 */}
          <div className="relative group">
            <div className="absolute -left-[25px] md:-left-[41px] top-1.5 w-3 h-3 bg-[#060606] border border-[#444] group-hover:border-drift-green transition-colors"></div>
            <span className="font-display text-2xl text-[#555] block mb-2">01</span>
            <h2 className="font-display text-2xl md:text-3xl text-white mb-4">Read-Only Access</h2>
            <p className="text-[#999] leading-relaxed font-light text-lg">
              We never ask for your broker passwords, net-banking logins, or transactional access. When you upload a CAS (Consolidated Account Statement), our engine parses the PDF in a strictly read-only environment to extract fee data. We cannot make trades or move money.
            </p>
          </div>

          {/* Statement 02 */}
          <div className="relative group">
            <div className="absolute -left-[25px] md:-left-[41px] top-1.5 w-3 h-3 bg-[#060606] border border-[#444] group-hover:border-drift-green transition-colors"></div>
            <span className="font-display text-2xl text-[#555] block mb-2">02</span>
            <h2 className="font-display text-2xl md:text-3xl text-white mb-4">No Data Selling</h2>
            <p className="text-[#999] leading-relaxed font-light text-lg">
              Unlike "free" brokers who sell your order flow and portfolio data to third-party hedge funds, we do not monetize your data. RatioX is completely independent. Your holding data is strictly used to power your personal dashboard and fee audit.
            </p>
          </div>

          {/* Statement 03 */}
          <div className="relative group">
            <div className="absolute -left-[25px] md:-left-[41px] top-1.5 w-3 h-3 bg-[#060606] border border-[#444] group-hover:border-drift-green transition-colors"></div>
            <span className="font-display text-2xl text-[#555] block mb-2">03</span>
            <h2 className="font-display text-2xl md:text-3xl text-white mb-4">Bank-Level Encryption</h2>
            <p className="text-[#999] leading-relaxed font-light text-lg">
              All data transmitted between your browser and our servers is encrypted using industry-standard TLS. Your data at rest is securely stored via Supabase, utilizing enterprise-grade Postgres databases with Row Level Security (RLS) ensuring nobody but you can query your portfolio.
            </p>
          </div>
          
          {/* Statement 04 */}
          <div className="relative group">
            <div className="absolute -left-[25px] md:-left-[41px] top-1.5 w-3 h-3 bg-[#060606] border border-[#444] group-hover:border-drift-green transition-colors"></div>
            <span className="font-display text-2xl text-[#555] block mb-2">04</span>
            <h2 className="font-display text-2xl md:text-3xl text-white mb-4">Zero Third-Party Tracking</h2>
            <p className="text-[#999] leading-relaxed font-light text-lg">
              We don't use invasive third-party ad trackers. We don't build shadow profiles of your financial habits. Our only goal is to show you the math behind your mutual funds. 
            </p>
          </div>

        </div>
        
        <div className="mt-16 md:mt-24 pt-6 border-t border-[#222]">
          <p className="text-[9px] font-mono text-[#444] leading-relaxed uppercase tracking-[0.1em]">
            Disclaimer: RatioX is a mathematical analysis tool for educational purposes. We are not SEBI-registered financial advisors. We do not provide investment advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Security;
