import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const stats = [
  { icon: TrendingUp, label: 'Performance', value: '+28.4%', color: 'text-blue-400' },
  { icon: ShoppingCart, label: 'Transactions', value: '1,420', color: 'text-indigo-400' },
  { icon: Package, label: 'Resources', value: '84.2k', color: 'text-sky-400' },
  { icon: Users, label: 'Active Fleet', value: '142', color: 'text-blue-300' },
];

export function LoginPage() {
  const [email, setEmail] = useState('admin@byteevolvr.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      console.error('Login error:', error);
      if (error.includes('Invalid login credentials') || error.includes('invalid_credentials')) {
        setError('Verification failed. Please check your system ID and access key.');
      } else if (error.includes('Email not confirmed')) {
        setError('System access pending. Please verify your identity via email.');
      } else {
        setError(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      
      {/* ── LEFT PANEL: Enhanced & Stable Layout ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative flex-col bg-[#00144a] p-16 xl:p-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#001e6c] via-[#00144a] to-[#000b2a]" />
        
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[100px]" />
        </div>

        {/* Brand Identity */}
        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
              <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter uppercase italic">ByteEvolvr</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 mb-10">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse" />
              <span className="text-blue-100/80 text-[10px] font-black tracking-[0.25em] uppercase">Control System v4.0.2</span>
            </div>
            
            <h1 className="text-6xl xl:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-10">
              Infinite <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-sky-400">Command.</span>
            </h1>
            
            <p className="text-blue-100/60 text-xl xl:text-2xl font-medium leading-relaxed mb-16 max-w-[600px]">
              The next generation of eCommerce orchestration. Master your data, scale your operations, and lead the market from one unified hub.
            </p>

            {/* Metrics Flex - Fixed Overlapping Issues */}
            <div className="flex flex-wrap gap-6 w-full max-w-2xl">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex-1 min-w-[240px] p-8 rounded-[32px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</span>
                  </div>
                  <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 shrink-0 flex items-center justify-between pt-10 border-t border-white/[0.08]">
          <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">© 2026 BYTEEVOLVR CORE</p>
          <div className="flex gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="hover:text-white/40 transition-colors cursor-pointer">Status</span>
            <span className="hover:text-white/40 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Precision Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f4f9] p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-[480px] py-12">
          
          {/* Brand Mark (Mobile Only) */}
          <div className="lg:hidden flex flex-col items-center mb-12">
            <div className="h-16 w-16 rounded-[24px] bg-[#001e6c] flex items-center justify-center shadow-2xl shadow-blue-900/30 mb-5">
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-[#001e6c] tracking-tighter uppercase italic">ByteEvolvr</h1>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,20,74,0.06)] border border-blue-50/50 p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent opacity-50" />

            <div className="mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Welcome</h2>
              <p className="text-slate-400 text-sm font-semibold tracking-tight">Access your secure workspace.</p>
            </div>

            {error && (
              <div className="mb-10 flex items-start gap-4 rounded-3xl bg-rose-50 border border-rose-100 p-5 text-sm text-rose-700 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-bold tracking-tight">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                  System ID
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-16 px-6 rounded-[26px] border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#001e6c] focus:ring-[8px] focus:ring-[#001e6c]/5 focus:outline-none transition-all text-sm font-bold shadow-sm"
                  placeholder="admin@byteevolvr.com"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Access Key</label>
                  <button type="button" className="text-[10px] text-blue-600 hover:text-blue-800 font-black uppercase tracking-widest">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 px-6 pr-16 rounded-[26px] border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#001e6c] focus:ring-[8px] focus:ring-[#001e6c]/5 focus:outline-none transition-all text-sm font-bold shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 flex items-center justify-center gap-3 rounded-[26px] bg-[#001e6c] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
                      Verifying...
                    </>
                  ) : (
                    'Initialize Access'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Internal Access Keys</p>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] text-slate-400 font-bold italic">admin@byteevolvr.com</span>
                  <span className="text-[10px] text-slate-900 font-black tracking-[0.1em]">Admin@123</span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] text-slate-400 font-bold italic">hemant.k@byteevolvr.com</span>
                  <span className="text-[10px] text-slate-900 font-black tracking-[0.1em]">Admin@123</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.5em] opacity-40">
            Secure Node v2.4.0
          </p>
        </div>
      </div>

    </div>
  );
}
