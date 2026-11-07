import React from "react";

/**
 * RatioX Logomark — A premium, iconic brand mark.
 * "The Intersection of Balance & Growth"
 * Combines a perfectly precise structural baseline (representing ratio and control)
 * with a fluid, glowing exponential sigmoid curve (representing wealth compounding and dynamic growth).
 */
const Logo = ({ size = 36, className = "" }: { size?: number; className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className} group select-none`}>
      {/* 
        The Logomark Container 
      */}
      <div className="relative flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-2">
        {/* Ambient background glow — active on hover for that "Unicorn" feel */}
        <div className="absolute inset-0 bg-amber/20 blur-[16px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 relative z-10"
        >
          <defs>
            {/* High-fidelity glowing gradient for the growth curve */}
            <linearGradient id="ratioXGradient" x1="8" y1="32" x2="32" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8890C" />
              <stop offset="45%" stopColor="#F9A826" />
              <stop offset="100%" stopColor="#FFD166" />
            </linearGradient>
            
            {/* Drop shadow for the curve to give it a neon 3D lift */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#E8890C" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 
            The Baseline (Structural X) 
            Represents the "Ratio" - the control, the baseline, the target allocation.
          */}
          <line 
            x1="9" y1="9" x2="31" y2="31" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="opacity-25 group-hover:opacity-60 transition-all duration-700 ease-out"
          />
          
          {/* 
            The Exponential Sigmoid (Growth)
            Represents "X" - the multiplier, compounding, wealth over time.
          */}
          <path 
            d="M 8 32 C 20 32, 20 8, 32 8" 
            stroke="url(#ratioXGradient)" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#neonGlow)"
            className="transition-all duration-700 ease-out drop-shadow-sm"
          />

          {/* 
            The Optimization Nodes 
            Represents the starting point and the optimized goal.
          */}
          <circle cx="8" cy="32" r="3" fill="#E8890C" className="transition-all duration-500" />
          
          {/* Glowing end node */}
          <g className="group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform duration-700">
            <circle cx="32" cy="8" r="3" fill="#FFD166" />
            <circle cx="32" cy="8" r="4.5" fill="#FFD166" className="opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
          </g>
        </svg>
      </div>
      
      {/* 
        The Wordmark 
      */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-[24px] tracking-[-0.03em]">
          <span className="font-medium text-foreground/90 transition-colors duration-500 group-hover:text-foreground">Ratio</span>
          <span className="font-bold bg-gradient-to-br from-[#E8890C] via-[#F9A826] to-[#FFD166] bg-clip-text text-transparent ml-[0.5px]">X</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
