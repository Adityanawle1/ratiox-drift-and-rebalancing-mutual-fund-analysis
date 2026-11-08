import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";
import Magnetic from "@/components/Magnetic";

const FounderCard = ({ number, name, surname, description, svgContent, linkUrl }: any) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const Content = () => (
    <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase inline-flex items-center gap-3 text-white group-hover:text-black transition-all duration-500">
      {name}
      {svgContent?.icon}
      {surname && (
        <span className="font-mono text-[10px] md:text-sm text-[#555] tracking-[0.3em] align-top transition-colors group-hover:text-[#333]">{surname}</span>
      )}
    </h2>
  );

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="border-b border-r border-[#222] p-6 sm:p-8 md:p-12 lg:p-14 hover:bg-white hover:text-black transition-colors duration-700 group flex flex-col justify-between min-h-[400px] relative overflow-hidden"
    >
      <div 
        className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-all duration-700 pointer-events-none"
        style={{
           transform: isHovered ? `translate(${(mousePosition.x - 200) * 0.05}px, ${(mousePosition.y - 200) * 0.05}px)` : 'translate(0px, 0px)'
        }}
      >
        {svgContent.watermark}
      </div>
      
      {isHovered && (
        <div 
          className="absolute pointer-events-none rounded-full blur-[80px] w-[300px] h-[300px] opacity-[0.15] z-0 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />
      )}

      <div className="flex justify-between items-start relative z-10">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#666] group-hover:text-[#333] transition-colors">Team</h3>
        <span className="font-display text-4xl text-[#333] group-hover:text-black transition-colors">{number}</span>
      </div>
      
      <div className="mt-16 relative z-10">
         <Magnetic strength={20}>
            {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity cursor-pointer">
                   <Content />
                </a>
            ) : (
               <div className="cursor-default">
                  <Content />
               </div>
            )}
         </Magnetic>
         <div className="w-0 group-hover:w-full h-[1px] bg-black transition-all duration-700 mt-6"></div>
         <p className="mt-8 font-light text-sm md:text-base text-[#888] group-hover:text-[#444] max-w-sm transition-colors duration-700 leading-relaxed font-body">
           "{description}"
         </p>
      </div>
    </div>
  );
};

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-body selection:bg-white selection:text-black overflow-x-hidden">
      <Nav />
      
      {/* Background Noise & Grain */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* Abstract Background Element (Spinning Wheel) */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0 flex items-center justify-center"
        style={{ transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px]" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="30" />
          <path d="M5 50h90M50 5v90M15 15l70 70M85 15L15 85" />
        </svg>
      </div>

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

        {/* Hero Section */}
        <header className="mb-16 md:mb-32 border-b border-[#222] pb-12 md:pb-20 relative">
          <h1 className="font-display text-6xl sm:text-7xl md:text-[10rem] tracking-tighter leading-[0.85] text-white mb-10 md:mb-16 lowercase relative inline-block">
            <span className="relative z-10">we build</span> <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#888] to-[#333] relative z-10">clarity.</span>
          </h1>
          <div className="grid md:grid-cols-12 gap-8 md:gap-6 relative z-10">
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#666]"></span> 01 // The Vision
              </p>
            </div>
            <div className="md:col-span-9">
              <p className="text-2xl md:text-4xl leading-tight font-light text-[#d0d0d0] tracking-tight hover:text-white transition-colors duration-500">
                To strip away the engineered complexity of the financial industry. We exist to expose the silent forces that erode generational wealth and give individuals the ultimate architecture for portfolio sovereignty.
              </p>
            </div>
          </div>
        </header>

        {/* The Team */}
        <section className="mb-16 md:mb-32">
          <div className="border-b border-[#222] pb-6 mb-10 md:mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">The Architects.</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#666]">02 // Genesis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[#222]">
            
            <FounderCard 
              number="01"
              name="Anantha"
              description="Complexity is a tax on the uninformed. We built this protocol because if mutual funds won't give you transparency, we will build it ourselves."
              svgContent={{
                icon: <svg width="28" height="28" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" className="text-[#666] group-hover:text-black transition-colors"><circle cx="50" cy="50" r="25"/><ellipse cx="50" cy="50" rx="45" ry="12" transform="rotate(-20 50 50)"/></svg>,
                watermark: <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="50" cy="50" r="25"/><ellipse cx="50" cy="50" rx="45" ry="12" transform="rotate(-20 50 50)"/></svg>
              }}
            />

            <FounderCard 
              number="02"
              name="Rashmita"
              description="Financial autonomy begins when hidden costs are laid bare. Algorithmic precision is the only hedge against systematic value extraction."
              svgContent={{
                icon: <svg width="26" height="26" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" className="text-[#666] group-hover:text-black transition-colors"><polygon points="50,10 90,50 50,90 10,50"/><circle cx="50" cy="50" r="14"/></svg>,
                watermark: <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="50,10 90,50 50,90 10,50"/><circle cx="50" cy="50" r="14"/></svg>
              }}
            />

            <FounderCard 
              number="03"
              name="Parth"
              description="Every basis point lost to inefficiency compounds into lost freedom. We engineer systems that ensure your capital works strictly for you."
              svgContent={{
                icon: <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" className="text-[#666] group-hover:text-black transition-colors"><path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z M50 50 L10 30 M50 50 L90 30 M50 50 V90" /></svg>,
                watermark: <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z M50 50 L10 30 M50 50 L90 30 M50 50 V90" /></svg>
              }}
            />

            <FounderCard 
              number="04"
              name="Aditya"
              description="If the mutual fund industry thrives on opacity, we exist to dismantle it. True wealth creation demands absolute, uncompromising clarity."
              linkUrl="https://portfolio-eight-umber-fian7abm8o.vercel.app/"
              svgContent={{
                icon: <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" className="text-[#666] group-hover:text-black transition-colors"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" /><circle cx="50" cy="50" r="10" /></svg>,
                watermark: <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" /><circle cx="50" cy="50" r="10" /></svg>
              }}
            />

          </div>
        </section>

        {/* Live Ticker / Matrix */}
        <section className="mb-16 md:mb-32">
          <div className="border border-[#222] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 bg-black relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000" 
                 style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#555] to-transparent opacity-50 animate-pulse" 
                 style={{ animation: 'scan 4s linear infinite', top: 'var(--scan-top, 0%)' }}></div>
                 
            <style>
              {`
                @keyframes scan {
                  0% { top: -10%; }
                  100% { top: 110%; }
                }
                @keyframes subtle-glitch {
                  0% { transform: translate(0) }
                  20% { transform: translate(-2px, 1px) }
                  40% { transform: translate(-1px, -1px) }
                  60% { transform: translate(2px, 1px) }
                  80% { transform: translate(1px, -1px) }
                  100% { transform: translate(0) }
                }
              `}
            </style>
            
            <div className="z-10 w-full">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" style={{ animation: glitch ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">System Status</span>
              </div>
              <h3 className={`font-display text-3xl md:text-5xl text-white tracking-tight mb-4 uppercase ${glitch ? 'text-red-500' : ''}`}
                  style={{ animation: glitch ? 'subtle-glitch 0.15s ease-in-out' : 'none' }}>
                Protocol Integrity: {glitch ? '99.9%' : '100%'}
              </h3>
              <p className="font-mono text-xs md:text-sm text-[#666] max-w-xl leading-relaxed">
                We continuously monitor and neutralize hidden asset decay. No commissions, no biased recommendations, no compromises. Just raw mathematical truth.
              </p>
            </div>

            <div className="z-10 shrink-0 font-mono text-[10px] md:text-xs text-[#555] text-right flex flex-col gap-3 uppercase tracking-[0.2em] w-full md:w-auto border-t md:border-t-0 md:border-l border-[#222] pt-6 md:pt-0 md:pl-12 mt-6 md:mt-0">
              <p className="flex justify-between gap-12 group-hover:text-white transition-colors duration-300" style={{ transitionDelay: '0ms' }}><span>Ping</span> <span>12ms</span></p>
              <p className="flex justify-between gap-12 group-hover:text-white transition-colors duration-300" style={{ transitionDelay: '75ms' }}><span>Drift Tolerance</span> <span>0.00%</span></p>
              <p className="flex justify-between gap-12 group-hover:text-white transition-colors duration-300" style={{ transitionDelay: '150ms' }}><span>Commission</span> <span>Zero</span></p>
              <p className="flex justify-between gap-12 group-hover:text-white transition-colors duration-300" style={{ transitionDelay: '225ms' }}><span>Clarity</span> <span>Absolute</span></p>
            </div>
          </div>
        </section>

        {/* Ethos & Free Statement */}
        <section className="mb-16 md:mb-32 flex flex-col items-center text-center py-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-50 blur-xl"></div>
            
            <div className="inline-block mb-6 px-4 py-1.5 border border-amber/30 bg-amber/10 text-amber font-mono text-xs uppercase tracking-widest rounded-full relative z-10 glow-text">
               100% Free Forever
            </div>

            <h2 className="font-display text-4xl md:text-7xl tracking-tighter text-white mb-8 hover:italic transition-all duration-300 cursor-default relative z-10">
              Pure logic. <br />
              <span className="gradient-text-amber glow-text">Zero cost.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-[#888] font-light max-w-3xl mx-auto leading-relaxed mb-6 relative z-10">
               We don't build walled gardens. We build uncompromised protocols to defend your capital against the decay of hidden fees and market drift. 
            </p>
            
            <p className="text-lg md:text-xl text-[#aaa] font-body max-w-2xl mx-auto relative z-10">
               Absolute financial clarity is a fundamental right. Our entire intelligence engine, analytics, and audits are now provided completely free for everyone. <strong className="text-white font-semibold">You will never pay a single penny.</strong>
            </p>
        </section>

        {/* CTA */}
        <div className="flex justify-center border-t border-[#222] pt-16 md:pt-24 pb-8 md:pb-12 relative z-10">
          <Magnetic strength={30}>
            <button 
              onClick={() => navigate("/dashboard/fee-audit")}
              className="bg-amber text-background font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[11px] sm:text-[12px] font-bold px-8 sm:px-12 py-5 sm:py-6 hover:brightness-110 hover:shadow-glow-amber transition-all rounded-[4px] w-full sm:w-auto hover:-translate-y-1"
            >
              [ Execute Free Audit ]
            </button>
          </Magnetic>
        </div>

      </main>
    </div>
  );
};

export default AboutUs;
