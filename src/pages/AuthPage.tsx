import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AuthGlobe from '@/components/AuthGlobe'
import Logo from '@/components/Logo'

type Mode = 'signin' | 'signup'

const AuthPage = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg('Check your email to confirm your account.')
      }
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-black flex">

      {/* Left side — Globe showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center overflow-hidden">
        {/* Globe */}
        <div className="absolute inset-0 z-0">
          <AuthGlobe />
        </div>

        {/* Branded overlay content on top of globe */}
        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <h2 className="font-display text-3xl xl:text-4xl font-semibold text-foreground mb-4 leading-tight">
              Your portfolio,<br />
              <span className="gradient-text-amber">always in balance.</span>
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
              Real-time drift detection, fee transparency, and tax-loss harvesting — all in one place.
            </p>
          </div>
        </div>

        {/* Subtle vignette on edges for depth */}
        <div className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%)'
          }}
        />
      </div>

      {/* Right side — Auth form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col relative">

        {/* Mobile globe background (visible only on mobile) */}
        <div className="absolute inset-0 z-0 lg:hidden opacity-40 pointer-events-none">
          <AuthGlobe />
        </div>

        {/* Edge glow line on left border (desktop) */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 10%, rgba(232,147,16,0.3) 50%, transparent 90%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 sm:px-12 lg:px-16">
          {/* Logo / Brand */}
          <div className="mb-10 flex flex-col items-center fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <Link to="/">
              <Logo size={36} className="mb-3" />
            </Link>
            <p className="mt-1 text-sm text-muted-foreground font-body">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Card */}
          <div
            className="w-full max-w-sm fade-in-up"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <div className="border border-white/[0.08] rounded-lg bg-card/60 backdrop-blur-2xl p-7 shadow-2xl shadow-black/40"
              style={{
                boxShadow: '0 0 80px rgba(232,147,16,0.04), 0 25px 50px rgba(0,0,0,0.5)'
              }}
            >
              {/* Google OAuth */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 border border-white/[0.08] rounded-md py-3 text-sm font-body text-foreground hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground/60 font-body uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Email/Password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="auth-email">
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber/30 transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-muted-foreground mb-1.5" htmlFor="auth-password">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber/30 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-drift-red/10 border border-drift-red/20 rounded-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-drift-red shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p className="text-xs text-drift-red font-body">{error}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-drift-green/10 border border-drift-green/20 rounded-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-drift-green shrink-0">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p className="text-xs text-drift-green font-body">{successMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber text-background font-body text-sm font-semibold py-3 rounded-md hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber/20"
                >
                  {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* Toggle mode */}
            <p className="mt-6 text-center text-sm font-body text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMsg(null) }}
                className="text-amber hover:text-amber/80 transition-colors duration-200 font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Footer link */}
          <div className="mt-auto pt-8 pb-6 fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
            <p className="text-xs text-muted-foreground/40 font-body text-center">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-muted-foreground/60 hover:text-foreground transition-colors">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-muted-foreground/60 hover:text-foreground transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
