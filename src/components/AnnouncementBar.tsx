import { useState } from "react";
import { Link } from "react-router-dom";

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber/10 via-amber/5 to-amber/10 border-b border-amber/10 z-[60]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center gap-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber/60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber"></span>
        </span>
        <p className="text-xs font-body text-foreground/90">
          <span className="font-semibold">New</span> — Free Mutual Fund Fee Audit: See exactly how much your TER is costing you.
          <Link to="/signup" className="ml-2 text-amber hover:underline font-semibold inline-flex items-center gap-1">
            Audit now <span className="text-[10px]">→</span>
          </Link>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
