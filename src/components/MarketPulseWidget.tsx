import { TrendingUp, TrendingDown, Activity, Globe, ExternalLink } from "lucide-react";

const MOCK_INDICES = [
  { name: "NIFTY 50", value: "24,123.45", change: "+0.85%", up: true },
  { name: "SENSEX", value: "79,456.78", change: "+0.72%", up: true },
  { name: "S&P 500", value: "5,432.10", change: "-0.21%", up: false },
  { name: "GOLD", value: "₹71,200", change: "+1.20%", up: true },
];

const MOCK_NEWS = [
  { 
    id: 1, 
    source: "Reuters", 
    time: "10m ago", 
    headline: "RBI keeps repo rate unchanged at 6.5%, maintains 'withdrawal of accommodation' stance", 
    impact: "neutral" 
  },
  { 
    id: 2, 
    source: "Bloomberg", 
    time: "1h ago", 
    headline: "Nifty hits new all-time high as IT stocks rally on strong forward guidance", 
    impact: "positive" 
  },
  { 
    id: 3, 
    source: "Mint", 
    time: "3h ago", 
    headline: "SEBI introduces new norms for mutual fund TER, impacting AMC margins globally", 
    impact: "negative" 
  },
];

export default function MarketPulseWidget() {
  return (
    <div className="bg-card/40 border border-surface-border/50 glass shadow-premium rounded-[12px] p-6 mb-8 relative overflow-hidden flex flex-col xl:flex-row gap-6 xl:gap-12">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Indices Section */}
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-amber" />
          <h2 className="font-display text-lg font-semibold text-foreground tracking-wide">Live Markets</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MOCK_INDICES.map((idx) => (
            <div key={idx.name} className="p-3 rounded-lg bg-background/50 border border-surface-border/50 group hover:border-amber/30 transition-colors">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">{idx.name}</p>
              <p className="font-mono text-sm md:text-base text-foreground font-medium mb-1 group-hover:text-amber transition-colors">{idx.value}</p>
              <div className={`flex items-center gap-1 text-xs font-mono ${idx.up ? "text-drift-green" : "text-drift-red"}`}>
                {idx.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {idx.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="hidden xl:block w-px bg-surface-border/50 self-stretch" />
      <div className="block xl:hidden h-px bg-surface-border/50 w-full" />

      {/* News Section */}
      <div className="flex-[1.5] relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber" />
            <h2 className="font-display text-lg font-semibold text-foreground tracking-wide">Market News</h2>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground px-2 py-1 bg-surface-border/30 rounded">Auto-updating</span>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_NEWS.map((news) => (
            <div key={news.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-surface-border/50 transition-all cursor-pointer">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-amber/80 uppercase tracking-wider">{news.source}</span>
                  <span className="text-[10px] text-muted-foreground">• {news.time}</span>
                </div>
                <h3 className="text-sm text-foreground/90 font-medium group-hover:text-amber transition-colors line-clamp-1">
                  {news.headline}
                </h3>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border
                  ${news.impact === 'positive' ? 'bg-drift-green/10 text-drift-green border-drift-green/20' : 
                    news.impact === 'negative' ? 'bg-drift-red/10 text-drift-red border-drift-red/20' : 
                    'bg-surface text-muted-foreground border-surface-border'}
                `}>
                  {news.impact}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
