import { useState, useMemo } from "react";
import { HoldingWithValue } from "@/lib/drift-engine";
import { computeCorpus, findFeeExceedsInvestedYear, formatINR } from "@/lib/fee-calculator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  holdings: HoldingWithValue[];
  terMap: Record<string, number>;
}

const CostProjectorTab = ({ holdings, terMap }: Props) => {
  const [monthlySIPAddition, setMonthlySIPAddition] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [projectionHorizon, setProjectionHorizon] = useState(10);

  const totalMfValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const weightedTer = useMemo(() => {
    let sum = 0, totalVal = 0;
    for (const h of holdings) {
      const ter = terMap[h.id];
      if (ter > 0) { sum += ter * h.marketValue; totalVal += h.marketValue; }
    }
    return totalVal > 0 ? sum / totalVal : 1.5;
  }, [holdings, terMap]);

  const chartData = useMemo(() => {
    const years = Array.from({ length: projectionHorizon }, (_, i) => i + 1);
    const grossRate = expectedReturn / 100;
    const netRate = grossRate - weightedTer / 100;

    return years.map(year => {
      const sipWithFees = computeCorpus(monthlySIPAddition, netRate, year);
      const sipWithoutFees = computeCorpus(monthlySIPAddition, grossRate, year);
      const lumpWithFees = totalMfValue * Math.pow(1 + netRate / 12, year * 12);
      const lumpWithoutFees = totalMfValue * Math.pow(1 + grossRate / 12, year * 12);
      const withFees = sipWithFees + lumpWithFees;
      const withoutFees = sipWithoutFees + lumpWithoutFees;
      return { year, withFees: Math.round(withFees), withoutFees: Math.round(withoutFees), feeDrag: Math.round(withoutFees - withFees) };
    });
  }, [monthlySIPAddition, expectedReturn, projectionHorizon, totalMfValue, weightedTer]);

  const milestoneRows = chartData.filter(d => [1, 5, 10, 15, 20, 25, 30].includes(d.year));
  const feeExceedYear = findFeeExceedsInvestedYear(monthlySIPAddition || totalMfValue / 120, expectedReturn, weightedTer);

  const formatTooltip = (value: number) => `₹${formatINR(value)}`;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-3 gap-4 p-5 bg-card border border-surface-border rounded-[2px]">
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Monthly SIP Addition (₹)</label>
          <input type="number" min={0} step={1000} value={monthlySIPAddition} onChange={e => setMonthlySIPAddition(Number(e.target.value))}
            className="w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-amber" />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Expected Return (%)</label>
          <input type="number" min={1} max={30} step={0.5} value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))}
            className="w-full bg-background border border-surface-border rounded-sm px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-amber" />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Horizon: {projectionHorizon}y</label>
          <input type="range" min={1} max={30} value={projectionHorizon} onChange={e => setProjectionHorizon(Number(e.target.value))}
            className="w-full h-1 bg-surface-border rounded-full appearance-none cursor-pointer accent-amber mt-2" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-surface-border rounded-[2px] p-6">
        <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-4">Portfolio Growth Projection</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(30 10% 60%)" }} tickFormatter={v => `${v}y`} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(30 10% 60%)" }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip formatter={formatTooltip} contentStyle={{ background: "hsl(0 0% 6.7%)", border: "1px solid hsl(0 0% 12%)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="withoutFees" name="Without Fees" stroke="#fff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="withFees" name="With Current TER" stroke="hsl(37 90% 55%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="border border-surface-border rounded-[2px] overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-surface-border bg-surface/30">
              <th className="text-left py-2.5 px-4">Year</th>
              <th className="text-right py-2.5 px-4">With Fees</th>
              <th className="text-right py-2.5 px-4">Without Fees</th>
              <th className="text-right py-2.5 px-4">Fee Drag</th>
            </tr>
          </thead>
          <tbody>
            {milestoneRows.map(r => (
              <tr key={r.year} className="border-b border-surface-border/30">
                <td className="py-2.5 px-4 text-muted-foreground">{r.year}</td>
                <td className="py-2.5 px-4 text-right text-foreground">₹{formatINR(r.withFees)}</td>
                <td className="py-2.5 px-4 text-right text-foreground">₹{formatINR(r.withoutFees)}</td>
                <td className="py-2.5 px-4 text-right text-amber">₹{formatINR(r.feeDrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Callout */}
      {feeExceedYear && (
        <div className="p-4 bg-drift-red/10 border border-drift-red/20 rounded-[2px]">
          <p className="text-sm font-body text-foreground">
            By year <span className="font-mono text-drift-red font-semibold">{feeExceedYear}</span>, fees will have cost you more than your entire original investment amount.
          </p>
        </div>
      )}
    </div>
  );
};

export default CostProjectorTab;
