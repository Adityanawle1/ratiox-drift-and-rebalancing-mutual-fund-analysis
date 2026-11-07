const SupportedBrokers = () => {
  const brokers = [
    { name: "Zerodha", domain: "zerodha.com" },
    { name: "Groww", domain: "groww.in" },
    { name: "Upstox", domain: "upstox.com" },
    { name: "INDmoney", domain: "indmoney.com" },
    { name: "AngelOne", domain: "angelone.in" },
  ];

  return (
    <div className="flex flex-col gap-3 mt-8">
      <p className="text-[10px] uppercase tracking-[0.15em] font-mono text-muted-foreground/50">
        Supports statements from
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {brokers.map((broker, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-surface/50 border border-surface-border/50 hover:border-amber/30 hover:bg-surface transition-all duration-300 group cursor-default"
            title={broker.name}
          >
            <img 
              src={`https://www.google.com/s2/favicons?domain=${broker.domain}&sz=64`} 
              alt={`${broker.name} logo`} 
              className="w-5 h-5 rounded-sm opacity-70 group-hover:opacity-100 transition-all duration-300 bg-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-body text-[13px] font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {broker.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportedBrokers;
