import React, { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Globe, TrendingUp, TrendingDown, ExternalLink, Search, Filter, ShieldAlert } from "lucide-react";

interface NewsItem {
  id: string;
  source: string;
  time: string;
  category: "regulation" | "macro" | "funds" | "equity";
  title: string;
  summary: string;
  impact: "positive" | "negative" | "neutral";
  impactDetail: string;
  url?: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "news-1",
    source: "AMFI India",
    time: "15m ago",
    category: "funds",
    title: "Indian Mutual Fund Industry AUM Crosses Milestone ₹65 Lakh Crore",
    summary: "Retail participation through systematic investment plans (SIPs) reaches record highs, driven by increased awareness of long-term compounding and direct plan cost benefits.",
    impact: "positive",
    impactDetail: "Surging retail inflow signals robust domestic liquidity cushion.",
  },
  {
    id: "news-2",
    source: "SEBI Circular",
    time: "1h ago",
    category: "regulation",
    title: "SEBI Mandates Enhanced Total Expense Ratio (TER) Granularity & Disclosure",
    summary: "Capital market regulator instructs AMCs to unbundle brokerage and transaction costs from stated TER, enhancing fee audit transparency for mutual fund unitholders.",
    impact: "positive",
    impactDetail: "Direct win for unitholder transparency and fee auditing engines.",
  },
  {
    id: "news-3",
    source: "Reserve Bank of India",
    time: "2h ago",
    category: "macro",
    title: "Monetary Policy Committee Maintains Repo Rate at 6.50%",
    summary: "Governor highlights resilience in domestic macro indicators while remaining vigilant on food inflation. Banking system liquidity returns to marginal surplus.",
    impact: "neutral",
    impactDetail: "Stable rate environment preserves debt fund yield predictability.",
  },
  {
    id: "news-4",
    source: "Mint Markets",
    time: "4h ago",
    category: "equity",
    title: "Mid-Cap and Small-Cap Segment Experiences Allocation Drift Correction",
    summary: "High valuations prompt institutional portfolio managers to initiate structured profit booking, reallocating towards large-cap equities and short-duration liquid assets.",
    impact: "neutral",
    impactDetail: "Portfolio drift monitors highlight widening asset class deviations.",
  },
  {
    id: "news-5",
    source: "Financial Express",
    time: "5h ago",
    category: "regulation",
    title: "Finance Ministry Rationalizes LTCG & STCG Holding Thresholds",
    summary: "Updated capital gains rules clarify classification between equity-oriented and non-equity mutual funds, optimizing tax-loss harvesting execution windows.",
    impact: "positive",
    impactDetail: "Provides clear guidance for year-end tax scenario modeling.",
  },
  {
    id: "news-6",
    source: "Bloomberg",
    time: "7h ago",
    category: "equity",
    title: "Foreign Institutional Investors Pivot to Domestic Sovereign Debt Instruments",
    summary: "FII net purchases in government bonds rise following global benchmark index inclusion, providing support to Indian Rupee stability.",
    impact: "positive",
    impactDetail: "Dampens foreign exchange volatility across multi-asset portfolios.",
  },
];

const MarketNews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-body selection:bg-white selection:text-black">
      <Nav />

      <main className="pt-24 md:pt-32 pb-20 px-5 md:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-[#222] pb-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-amber" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#888]">
              Macro Intelligence & Regulatory Wire
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tighter text-white lowercase">
            market <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber/80 to-[#888]">pulse.</span>
          </h1>
          <p className="mt-4 font-light text-base md:text-lg text-[#999] max-w-2xl leading-relaxed">
            Real-time regulatory circulars, mutual fund fee updates, and macroeconomic indicators tracked to protect your capital from silent policy drift.
          </p>
        </header>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-10 pb-6 border-b border-[#1c1c1c]">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Intelligence" },
              { id: "regulation", label: "SEBI & Regulations" },
              { id: "funds", label: "Mutual Funds" },
              { id: "macro", label: "RBI & Macro" },
              { id: "equity", label: "Equity & Capital Flow" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`font-mono text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-[3px] transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber text-black font-semibold shadow-glow-amber"
                    : "bg-[#111] text-[#777] border border-[#222] hover:text-white hover:border-[#333]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search news or circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#222] rounded-[4px] pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-amber transition-colors"
            />
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="bg-[#0b0b0b] border border-[#1e1e1e] hover:border-[#333] transition-all p-6 rounded-[4px] flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber font-semibold">
                      {item.source}
                    </span>
                    <span className="text-[#444] text-[10px]">•</span>
                    <span className="font-mono text-[10px] text-[#666]">{item.time}</span>
                  </div>

                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] border ${
                      item.impact === "positive"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : item.impact === "negative"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-[#1a1a1a] text-[#888] border-[#2a2a2a]"
                    }`}
                  >
                    {item.impact} impact
                  </span>
                </div>

                <h2 className="font-display text-xl text-white group-hover:text-amber transition-colors leading-snug mb-3">
                  {item.title}
                </h2>

                <p className="font-body text-xs text-[#888] leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#181818] flex items-center justify-between text-[11px] font-mono text-[#666]">
                <span className="text-[#777] italic line-clamp-1">Insight: {item.impactDetail}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#555] group-hover:text-amber transition-colors shrink-0 ml-2" />
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-20 border border-[#222] rounded-[4px]">
            <p className="font-mono text-xs uppercase tracking-widest text-[#666]">No circulars or articles matching your filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MarketNews;

