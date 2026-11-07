import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setUserRiskProfile, RISK_PROFILES } from "@/api/portfolio";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof RISK_PROFILES | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!selectedProfile) { setError("Please select a risk profile"); return; }
    setError("");
    setLoading(true);

    try {
      const { error: profileError } = await setUserRiskProfile(user!.id, selectedProfile);
      
      if (profileError) { 
        console.error('Profile update error:', profileError);
        setError("Failed to set profile. Please try again.");
        setLoading(false);
        return;
      }

      setError("Setup complete! Redirecting to dashboard...");
      setTimeout(() => {
        setLoading(false);
        // Force navigation with replace to prevent back button issues
        navigate("/dashboard/fee-audit", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-display text-xl font-bold text-amber">Ratio x</span>
        </div>

        <div className="border border-surface-border rounded-sm bg-card p-6 md:p-8">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Choose your risk profile</h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Select a risk profile to automatically set up your target allocation. You can customize it later.
          </p>

          <div className="space-y-4">
            {Object.entries(RISK_PROFILES).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => setSelectedProfile(key as keyof typeof RISK_PROFILES)}
                className={`relative w-full text-left p-6 rounded-sm border transition-all duration-150 ${
                  selectedProfile === key
                    ? "border-amber bg-amber/5"
                    : "border-surface-border hover:border-muted-foreground"
                }`}
              >
                {key === 'moderate' && (
                  <span className="absolute top-4 right-4 text-[10px] font-body font-semibold bg-amber text-background px-2 py-0.5 rounded-sm">
                    Most Common
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-lg font-display font-semibold text-foreground mb-1">{profile.name}</p>
                    <p className="text-sm text-muted-foreground font-body mb-3">{profile.description}</p>
                    <div className="text-xs text-muted-foreground font-body leading-relaxed">
                      {profile.allocations
                        .map(a => `${a.asset_class.replace(' Equity', '').replace(' Funds', '')} ${a.target_pct}%`)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedProfile === key 
                      ? 'border-amber bg-amber' 
                      : 'border-surface-border'
                  }`}>
                    {selectedProfile === key && (
                      <div className="w-2 h-2 bg-background rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className={`mt-4 p-3 rounded-sm text-xs font-body ${
              error.includes('complete') || error.includes('Redirecting') 
                ? 'bg-amber/10 text-amber border border-amber/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {error}
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={loading || !selectedProfile}
            className="mt-6 w-full bg-amber text-background font-body text-sm font-medium py-3 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up portfolio..." : "Complete Setup"}
          </button>

          {/* Emergency bypass button */}
          <button
            onClick={() => navigate("/dashboard/fee-audit")}
            className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip setup and go to dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
