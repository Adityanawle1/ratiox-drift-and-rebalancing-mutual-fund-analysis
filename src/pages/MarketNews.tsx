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
        <header className="mb-12 border-b border-[#1e1e1e] pb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">
            Market Pulse
          </h1>
          <p className="text-sm md:text-base text-[#999] max-w-2xl leading-relaxed">
            Regulatory circulars, mutual fund fee updates, and macroeconomic indicators relevant to your portfolio.
          </p>
        </header>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-10 pb-6 border-b border-[#1a1a1a]">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "regulation", label: "Regulations" },
              { id: "funds", label: "Mutual Funds" },
              { id: "macro", label: "Macro" },
              { id: "equity", label: "Equity" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[13px] font-medium px-3.5 py-1.5 rounded-md transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber text-black font-semibold"
                    : "bg-[#111] text-[#777] border border-[#1e1e1e] hover:text-white hover:border-[#333]"
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
              className="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-md pl-9 pr-4 py-2 text-[13px] text-white placeholder-[#555] focus:outline-none focus:border-amber transition-colors"
            />
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="bg-[#0b0b0b] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-all p-6 rounded-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-amber font-medium">
                      {item.source}
                    </span>
                    <span className="text-[#444] text-[10px]">•</span>
                    <span className="text-[12px] text-[#666]">{item.time}</span>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      item.impact === "positive"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.impact === "negative"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-[#1a1a1a] text-[#888]"
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>

                <h2 className="text-[16px] font-medium text-white group-hover:text-amber transition-colors leading-snug mb-3">
                  {item.title}
                </h2>

                <p className="text-[13px] text-[#888] leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#151515] flex items-center justify-between text-[12px] text-[#666]">
                <span className="text-[#777] italic line-clamp-1">{item.impactDetail}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#555] group-hover:text-amber transition-colors shrink-0 ml-2" />
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-20 border border-[#1e1e1e] rounded-lg">
            <p className="text-sm text-[#666]">No articles matching your filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MarketNews;

