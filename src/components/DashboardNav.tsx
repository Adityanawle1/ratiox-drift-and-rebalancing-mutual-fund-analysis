import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sliders, Receipt, Percent, Globe, LogOut, HelpCircle } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="text-lg font-semibold tracking-tight text-white group-hover:text-amber transition-colors">
              Ratio<span className="text-amber">x</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-1 bg-[#111] p-1 rounded-lg border border-[#1e1e1e]">
          {navItems.map((item) => {
            const isActive = item.active;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber text-black font-semibold"
                    : "text-[#999] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
                {item.isPro && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                      isActive ? "bg-black/20 text-black" : "bg-amber/15 text-amber"
                    }`}
                  >
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/learn-drift"
            className="hidden md:flex items-center gap-1.5 text-[13px] text-[#888] hover:text-white transition-colors px-2 py-1"
            title="Documentation"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Docs</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#121212] border border-[#1e1e1e]">
            <div className="w-5 h-5 rounded-full bg-amber/15 text-amber text-[10px] font-semibold flex items-center justify-center">
              {userInitial}
            </div>
            <span className="text-[13px] text-[#aaa] max-w-[120px] truncate">
              {user?.email?.split("@")[0] || "User"}
            </span>
          </div>

          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-1.5 text-[13px] text-[#777] hover:text-rose-400 p-2 rounded-md hover:bg-rose-500/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
