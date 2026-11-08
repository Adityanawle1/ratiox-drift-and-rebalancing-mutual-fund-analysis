import React from "react";

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#333] animate-ping opacity-20" />
          <div className="w-8 h-8 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <div className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#777] animate-pulse">
          Loading RatioX...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;

