import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { useAuthStore } from '@byteevolvr/store';
import { AuthService } from '@byteevolvr/api-client';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { setUser, setToken, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  // Track mouse for dynamic background glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await AuthService.adminLogin(email, password);
      const adminUser = data.user;

      if (adminUser?.role !== 'admin' && adminUser?.role !== 'super-admin') {
        setError('Admin access required');
        setIsLoading(false);
        return;
      }

      setToken(data.token, 'admin');
      setUser(adminUser);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.customMessage || err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Background Glow following cursor */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.15), transparent 80%)`
        }}
      />

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      
      {/* Geometric Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center p-6 lg:p-16 gap-12 lg:gap-24">
        
        {/* Left Side: Brand & Copy */}
        <div className="w-full flex flex-col justify-center text-center lg:text-left pt-12 lg:pt-0">
          <div className="w-full flex justify-center lg:justify-start mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse" />
              <span className="text-indigo-200 text-xs font-semibold tracking-widest uppercase">Admin Secure Portal</span>
            </div>
          </div>
          
          <h1 className="w-full text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6">
            ByteEvolvr <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              Command Center.
            </span>
          </h1>
          
          <p className="w-full max-w-xl text-slate-400 text-lg lg:text-xl font-medium leading-relaxed mx-auto lg:mx-0">
            Welcome back. Securely authenticate to manage your unified commerce operations, view analytics, and orchestrate growth from one place.
          </p>

          <div className="hidden lg:flex w-full items-center gap-8 mt-10 opacity-60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="text-slate-300 text-sm font-semibold tracking-wider uppercase">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-300 text-sm font-semibold tracking-wider uppercase">Biometric Ready</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
          <div className="relative rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-2xl p-8 sm:p-12 overflow-hidden group">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="mb-10 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-6">
                <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Authenticate</h2>
              <p className="text-slate-400 text-sm mt-2">Enter your admin credentials</p>
            </div>

            {error && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-200">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-slate-600 focus:bg-black/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none backdrop-blur-sm"
                    placeholder="admin@byteevolvr.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 px-5 pr-12 rounded-2xl border border-white/[0.08] bg-black/20 text-white placeholder:text-slate-600 focus:bg-black/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-bold text-sm tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-black" strokeWidth={3} />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Session</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" strokeWidth={2.5} />
                    </>
                  )}
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover/btn:animate-[shine_1s_ease-in-out]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
