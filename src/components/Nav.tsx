import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MAIN_NAVIGATION } from "@/config/navigation";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const renderDesktopLink = (item: any) => {
    if (item.children) {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-body outline-none data-[state=open]:text-foreground">
            {item.label} <ChevronDown className="w-3 h-3 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-sm w-48 p-1 shadow-2xl">
            {item.children.map((child: any) => (
              <DropdownMenuItem key={child.label} asChild className="cursor-pointer focus:bg-white/10 focus:text-white rounded-sm data-[highlighted]:bg-white/10 data-[highlighted]:text-white">
                {child.href.startsWith("/#") ? (
                  <a href={child.href} className="w-full font-body text-sm text-muted-foreground">{child.label}</a>
                ) : (
                  <Link to={child.href} className="w-full font-body text-sm text-muted-foreground">{child.label}</Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Fallback for flat links (if any are added later)
    return item.href.startsWith("/#") ? (
      <a
        key={item.label}
        href={item.href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-body"
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={item.label}
        to={item.href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-body"
      >
        {item.label}
      </Link>
    );
  };

  const renderMobileLink = (item: any) => {
    if (item.children) {
      return (
        <div key={item.label} className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
          <div className="flex flex-col gap-4 pl-4 border-l border-white/10">
            {item.children.map((child: any) => (
              child.href.startsWith("/#") ? (
                <a
                  key={child.label}
                  href={child.href}
                  className="text-base text-white hover:text-drift-green transition-colors font-body"
                  onClick={() => setMobileOpen(false)}
                >
                  {child.label}
                </a>
              ) : (
                <Link
                  key={child.label}
                  to={child.href}
                  className="text-base text-white hover:text-drift-green transition-colors font-body"
                  onClick={() => setMobileOpen(false)}
                >
                  {child.label}
                </Link>
              )
            ))}
          </div>
        </div>
      );
    }

    return item.href.startsWith("/#") ? (
      <a
        key={item.label}
        href={item.href}
        className="text-base text-muted-foreground hover:text-foreground transition-colors font-body"
        onClick={() => setMobileOpen(false)}
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={item.label}
        to={item.href}
        className="text-base text-muted-foreground hover:text-foreground transition-colors font-body"
        onClick={() => setMobileOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="group">
          <Logo size={28} className="group-hover:opacity-80 transition-opacity duration-300" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {MAIN_NAVIGATION.map(renderDesktopLink)}
          {user ? (
            <Link
              to="/dashboard/fee-audit"
              className="text-sm font-body font-semibold border border-amber/50 text-amber px-5 py-2.5 rounded-sm hover:bg-amber hover:text-background transition-all duration-300 active:scale-[0.98]"
            >
              Fee Audit →
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-body font-semibold border border-amber/50 text-amber px-5 py-2.5 rounded-sm hover:bg-amber hover:text-background transition-all duration-300 active:scale-[0.98]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileOpen ? (
              <path d="M4 4l12 12M16 4L4 16" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-black/95 backdrop-blur-xl px-6 py-6 flex flex-col gap-8 h-screen overflow-y-auto pb-32">
          {MAIN_NAVIGATION.map(renderMobileLink)}
          
          <div className="pt-6 border-t border-surface-border">
            {user ? (
              <Link
                to="/dashboard"
                className="block w-full text-sm font-body font-semibold border border-amber/50 text-amber px-5 py-4 rounded-sm text-center hover:bg-amber hover:text-background transition-all duration-300"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard →
              </Link>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-sm font-body font-semibold border border-amber/50 text-amber px-5 py-4 rounded-sm text-center hover:bg-amber hover:text-background transition-all duration-300"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
