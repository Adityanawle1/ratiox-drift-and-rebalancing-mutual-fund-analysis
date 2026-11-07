/**
 * SocialProof — trust signals to display in the hero section.
 * Shows avatar stack + investor count + mutual fund focused messaging.
 */
const SocialProof = () => {
  const avatarColors = [
    "bg-amber/80", "bg-blue-400/80", "bg-emerald-400/80",
    "bg-violet-400/80", "bg-rose-400/80",
  ];
  const initials = ["AN", "PR", "SK", "VM", "RJ"];

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar stack + count */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2.5">
          {avatarColors.map((color, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-[10px] font-mono font-semibold text-white/90`}
            >
              {initials[i]}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-body text-foreground font-medium">Early access users</span>
          <span className="text-xs text-muted-foreground font-body">auditing their MF fees on Ratio x</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[10px] font-body text-muted-foreground/60 uppercase tracking-wider">Covers</span>
        <div className="flex items-center gap-3">
          {[
            { name: "500+ MFs", icon: "📊" },
            { name: "All AMCs", icon: "🏦" },
            { name: "AMFI Data", icon: "✓" },
          ].map((tech) => (
            <span
              key={tech.name}
              className="inline-flex items-center gap-1.5 text-[11px] font-body text-muted-foreground/70 border border-surface-border px-2 py-1 rounded-sm hover:border-white/10 transition-colors"
            >
              <span className="text-xs">{tech.icon}</span>
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;
