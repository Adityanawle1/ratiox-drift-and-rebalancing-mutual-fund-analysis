import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sliders, Receipt, Percent, Globe, LogOut, HelpCircle, ShieldCheck } from "lucide-react";

interface DashboardNavProps {
  activeTab?: "drift" | "fee-audit" | "tax-harvesting" | "news";
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: "drift",
      label: "Drift Engine",
      href: "/dashboard",
      icon: <Sliders className="w-3.5 h-3.5" />,
      active: activeTab === "drift" || currentPath === "/dashboard",
    },
    {
      id: "fee-audit",
      label: "Fee Audit",
      href: "/dashboard/fee-audit",
      icon: <Receipt className="w-3.5 h-3.5" />,
      active: activeTab === "fee-audit" || currentPath === "/dashboard/fee-audit",
    },
    {
      id: "tax-harvesting",
      label: "Tax Harvesting",
      href: "/dashboard/tax-harvesting",
      icon: <Percent className="w-3.5 h-3.5" />,
      isPro: true,
      active: activeTab === "tax-harvesting" || currentPath === "/dashboard/tax-harvesting",
    },
    {
      id: "news",
      label: "Market Wire",
      href: "/news",
      icon: <Globe className="w-3.5 h-3.5" />,
      active: activeTab === "news" || currentPath === "/news",
    },
  ];

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/90 backdrop-blur-md border-b border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Terminal Status */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-amber transition-colors">
              Ratio<span className="text-amber">x</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>TERMINAL LIVE</span>
          </div>
        </div>

        {/* Center: Segmented Navigation Control */}
        <nav className="flex items-center bg-[#111] p-1 rounded-lg border border-[#222]">
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-amber text-black font-semibold shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                    : "text-[#888] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
                {item.isPro && (
                  <span
                    className={`text-[8px] font-bold px-1 rounded uppercase tracking-tighter ${
                      isActive ? "bg-black/30 text-black" : "bg-amber/20 text-amber border border-amber/30"
                    }`}
                  >
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/learn-drift"
            className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#777] hover:text-white transition-colors px-2 py-1"
            title="Protocol Documentation"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#666]" />
            <span className="text-[11px] uppercase tracking-wider">Docs</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#121212] border border-[#222]">
            <div className="w-5 h-5 rounded-full bg-amber/20 border border-amber/40 text-amber text-[10px] font-mono font-bold flex items-center justify-center">
              {userInitial}
            </div>
            <span className="text-xs font-mono text-[#aaa] max-w-[140px] truncate">
              {user?.email?.split("@")[0] || "Trader"}
            </span>
          </div>

          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-[#777] hover:text-rose-400 p-2 rounded-md hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            title="Sign out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] uppercase tracking-wider">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;

