import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthGlobe from "@/components/AuthGlobe";
import Logo from "@/components/Logo";

const Signup = () => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    const { error } = await signUp(email, password, fullName);
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
  };

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm text-foreground font-body placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber/30 transition-all duration-200";

  // --- Success state ---
  if (success) {
    return (
      <div className="min-h-screen bg-black flex">
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0"><AuthGlobe /></div>
          <div className="relative z-10 max-w-md px-10 text-center">
            <div className="fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
              <h2 className="font-display text-3xl xl:text-4xl font-semibold text-foreground mb-4 leading-tight">
                You're almost<br /><span className="gradient-text-amber">there.</span>
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
                One click in your inbox and your portfolio journey begins.
              </p>
            </div>
          </div>
          <div className="absolute inset-0 z-[5] pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%)' }} />
        </div>

        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col relative">
          <div className="absolute inset-0 z-0 lg:hidden opacity-40 pointer-events-none"><AuthGlobe /></div>
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px z-20" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(232,147,16,0.3) 50%, transparent 90%)' }} />

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 sm:px-12 lg:px-16">
            <Link to="/" className="mb-10"><Logo size={36} /></Link>

            <div className="w-full max-w-sm fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <div className="border border-white/[0.08] rounded-lg bg-card/60 backdrop-blur-2xl p-8 text-center" style={{ boxShadow: '0 0 80px rgba(232,147,16,0.04), 0 25px 50px rgba(0,0,0,0.5)' }}>
                <div className="w-14 h-14 mx-auto mb-5 bg-drift-green/10 border border-drift-green/20 rounded-full flex items-center justify-center">
                  <span className="text-drift-green text-xl">✓</span>
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Check your email</h2>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                  We've sent a confirmation link to <strong className="text-foreground">{email}</strong>.
                  Click it to activate your account.
                </p>
                <Link to="/login" className="inline-block w-full bg-amber text-background font-body text-sm font-semibold py-3 rounded-md hover:brightness-110 transition-all duration-200 text-center shadow-lg shadow-amber/20">
                  Go to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Form state ---
  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0"><AuthGlobe /></div>
        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <h2 className="font-display text-3xl xl:text-4xl font-semibold text-foreground mb-4 leading-tight">
              Start tracking<br /><span className="gradient-text-amber">smarter today.</span>
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
              Join 500+ investors using Ratio x for drift detection, fee transparency, and tax-loss harvesting.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 z-[5] pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col relative">
        <div className="absolute inset-0 z-0 lg:hidden opacity-40 pointer-events-none"><AuthGlobe /></div>
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px z-20" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(232,147,16,0.3) 50%, transparent 90%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 sm:px-12 lg:px-16">
          <div className="mb-10 flex flex-col items-center fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <Link to="/"><Logo size={36} className="mb-3" /></Link>
            <h1 className="font-display text-2xl font-semibold text-foreground mt-2">Create your account</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Start tracking your portfolio drift</p>
          </div>

          <div className="w-full max-w-sm fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <div className="border border-white/[0.08] rounded-lg bg-card/60 backdrop-blur-2xl p-7" style={{ boxShadow: '0 0 80px rgba(232,147,16,0.04), 0 25px 50px rgba(0,0,0,0.5)' }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="signup-name">Full name</label>
                  <input id="signup-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="signup-email">Email address</label>
                  <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="signup-password">Password</label>
                  <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required className={inputCls} />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-drift-red/10 border border-drift-red/20 rounded-md">
                    <span className="text-drift-red text-sm">✕</span>
                    <p className="text-xs text-drift-red font-body">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-amber text-background font-body text-sm font-semibold py-3 rounded-md hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber/20">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground font-body">
              Already have an account? <Link to="/login" className="text-amber hover:text-amber/80 transition-colors font-medium">Sign in</Link>
            </p>
          </div>

          <div className="mt-auto pt-8 pb-6">
            <p className="text-xs text-muted-foreground/40 font-body text-center">
              By continuing, you agree to our <Link to="/terms" className="text-muted-foreground/60 hover:text-foreground transition-colors">Terms</Link> and <Link to="/privacy" className="text-muted-foreground/60 hover:text-foreground transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
