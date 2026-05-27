import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '@byteevolvr/api-client';
import { useAuthStore } from '@byteevolvr/store';
import { Button } from '@byteevolvr/ui';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useAuthStore();
  
  const from = location.state?.from?.pathname || '/shop/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await AuthService.login(email, password);
      setToken(token, 'auth');
      setUser(user);
      navigate(from, { replace: true });
    } catch (signInError: unknown) {
      const error = signInError as any;
      setError(error.customMessage || error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 pt-32 overflow-hidden bg-[#020617]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse z-0" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl border border-white/10 transition-all hover:border-white/20">
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 mb-4 ring-1 ring-white/10 shadow-inner">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-brand-muted font-medium">Log in to continue shopping</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mr-3 shrink-0"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-muted ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/20 outline-none backdrop-blur-sm transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-brand-muted">Password</label>
              <a href="#" className="text-xs font-semibold text-accent hover:text-accent-light transition-colors">Forgot password?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-accent" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/20 outline-none backdrop-blur-sm transition-all focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="group relative w-full overflow-hidden rounded-xl bg-white text-black hover:bg-gray-100 py-6 font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-brand-muted">
          <span>New to ByteeVolvr?</span>
          <Link to="/shop/signup" className="font-semibold text-white hover:text-accent transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-accent">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
