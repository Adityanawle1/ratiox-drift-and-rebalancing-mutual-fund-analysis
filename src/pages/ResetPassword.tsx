import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Listen for the hash change to make sure we have the access token from Supabase
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("idle");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setStatus("loading");
    const { error } = await updatePassword(password);
    
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Your password has been updated successfully.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm fade-in-up">
        <div className="mb-10 flex flex-col items-center">
          <Link to="/"><Logo size={36} className="mb-3" /></Link>
          <h1 className="font-display text-2xl font-semibold text-foreground mt-2">Update Password</h1>
          <p className="text-sm text-muted-foreground font-body mt-1 text-center">
            Enter your new password below.
          </p>
        </div>

        <div className="border border-white/[0.08] rounded-lg bg-card/60 backdrop-blur-2xl p-7 shadow-2xl">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-drift-green/10 border border-drift-green/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-drift-green">✓</span>
              </div>
              <p className="text-sm text-foreground font-body mb-6">{message}</p>
              <p className="text-xs text-muted-foreground font-body">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="new-password">New Password</label>
                <input 
                  id="new-password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm text-foreground font-body placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber/30 transition-all duration-200"
                />
              </div>
              
              {status === "error" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-drift-red/10 border border-drift-red/20 rounded-md">
                  <span className="text-drift-red text-sm">✕</span>
                  <p className="text-xs text-drift-red font-body">{message}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={status === "loading" || password.length < 6} 
                className="w-full bg-amber text-background font-body text-sm font-semibold py-3 rounded-md hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
