import { useScrollReveal } from "./useScrollReveal";

const rows = [
  {
    feature: "Mutual fund fee audit",
    ratiox: true,
    spreadsheets: false,
    paidAdvisors: "Sometimes",
  },
  {
    feature: "Regular vs Direct comparison",
    ratiox: true,
    spreadsheets: false,
    paidAdvisors: false,
  },
  {
    feature: "Hidden cost breakdown (GST, STT)",
    ratiox: true,
    spreadsheets: false,
    paidAdvisors: false,
  },
  {
    feature: "10-year fee projection",
    ratiox: true,
    spreadsheets: "DIY formulas",
    paidAdvisors: "Sometimes",
  },
  {
    feature: "Drift detection",
    ratiox: true,
    spreadsheets: "Manual calculation",
    paidAdvisors: true,
  },
  {
    feature: "Tax-loss harvesting",
    ratiox: true,
    spreadsheets: false,
    paidAdvisors: true,
  },
  {
    feature: "Rebalance scenarios",
    ratiox: true,
    spreadsheets: "DIY formulas",
    paidAdvisors: true,
  },
  {
    feature: "Real-time health score",
    ratiox: true,
    spreadsheets: false,
    paidAdvisors: false,
  },
  {
    feature: "Cost",
    ratiox: "Free",
    spreadsheets: "Free",
    paidAdvisors: "₹5K–₹50K/year",
  },
  {
    feature: "Setup time",
    ratiox: "5 minutes",
    spreadsheets: "Hours",
    paidAdvisors: "Days",
  },
];

const renderCell = (value: boolean | string) => {
  if (value === true)
    return (
      <svg className="w-5 h-5 text-drift-green mx-auto" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (value === false)
    return (
      <svg className="w-4 h-4 text-muted-foreground/30 mx-auto" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
      </svg>
    );
  return <span className="text-xs font-body text-muted-foreground">{value}</span>;
};

const ComparisonTable = () => {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section className="py-24 md:py-32 border-t border-surface-border bg-background" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-muted-foreground/30" />
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Why Ratio x
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight max-w-2xl">
            No one else shows you <br className="hidden md:block" />
            <span className="text-amber">the full picture.</span>
          </h2>
        </div>

        {/* Table */}
        <div className={`overflow-x-auto transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-4 pr-6 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground w-1/4">Feature</th>
                <th className="py-4 px-4 text-center w-1/4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-display text-base font-semibold text-amber">Ratio x</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground w-1/4">Spreadsheets</th>
                <th className="py-4 px-4 text-center text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground w-1/4">Paid Advisors</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className="border-b border-surface-border/50 hover:bg-surface/20 transition-colors"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.5s ease ${i * 60 + 200}ms`,
                  }}
                >
                  <td className="py-4 pr-6 text-sm font-body text-foreground">{row.feature}</td>
                  <td className="py-4 px-4 text-center bg-amber/[0.03]">{renderCell(row.ratiox)}</td>
                  <td className="py-4 px-4 text-center">{renderCell(row.spreadsheets)}</td>
                  <td className="py-4 px-4 text-center">{renderCell(row.paidAdvisors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
