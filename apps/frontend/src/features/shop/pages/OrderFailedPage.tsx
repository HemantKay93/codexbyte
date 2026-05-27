import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function OrderFailedPage() {
  const navigate = useNavigate();
  const [timestamp, setTimestamp] = React.useState('');

  React.useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const date = now.toISOString().split('T')[0].replace(/-/g, '.');
      const time = now.toTimeString().split(' ')[0];
      setTimestamp(`${date} // ${time}`);
    };
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-grow flex items-center justify-center px-stitch-container-padding-mobile pt-12 pb-20 overflow-hidden relative min-h-[calc(100vh-160px)]">
      {/* Atmospheric Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-stitch-error-container/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-stitch-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Error Visualization Card */}
        <div className="stitch-glass-panel p-stitch-gutter md:p-12 rounded-xl border-t border-l border-white/5 flex flex-col items-center" style={{boxShadow: '0 0 30px rgba(255, 180, 171, 0.15)'}}>
          {/* Warning Icon with Pulsing LED effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-stitch-error/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-24 h-24 rounded-full bg-stitch-error-container/20 border border-stitch-error/30 flex items-center justify-center relative">
              <span
                className="material-symbols-outlined text-stitch-error text-6xl"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                warning
              </span>
            </div>
          </div>
          
          <div className="space-y-4 mb-10">
            <h2 className="font-stitch-display-lg text-stitch-display-lg-mobile md:text-stitch-headline-lg text-stitch-on-surface tracking-tight uppercase">
              Order Failed
            </h2>
            <p className="font-stitch-body-md text-stitch-body-md text-stitch-outline-variant max-w-md mx-auto">
              We encountered a critical interruption during your transaction. Your payment could not be processed at this time.
            </p>
          </div>
          
          {/* Technical Details Breakdown (Terminal Style) */}
          <div className="w-full bg-stitch-surface-container-lowest/50 rounded-lg p-6 mb-10 border border-stitch-outline-variant/10 text-left font-stitch-label-sm text-stitch-label-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-stitch-outline">ERROR_CODE:</span>
              <span className="text-stitch-error font-bold">X-PAY-INT-402</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stitch-outline">SYSTEM_STATUS:</span>
              <span className="text-stitch-on-surface">TIMEOUT_OR_DENIED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stitch-outline">TIMESTAMP:</span>
              <span className="text-stitch-on-surface">{timestamp}</span>
            </div>
          </div>
          
          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={() => navigate('/shop/checkout')}
              className="flex-1 bg-gradient-to-r from-stitch-primary-container to-stitch-primary text-stitch-on-primary-container h-14 rounded-lg font-stitch-cta-button text-stitch-cta-button flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-stitch-primary/20 uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Retry Payment
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="flex-1 border border-stitch-outline-variant/30 text-stitch-on-surface h-14 rounded-lg font-stitch-cta-button text-stitch-cta-button flex items-center justify-center gap-2 hover:bg-stitch-surface-variant/30 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xl">support_agent</span>
              Contact Support
            </button>
          </div>
          
          {/* Secondary Link */}
          <Link
            to="/shop"
            className="mt-8 font-stitch-label-sm text-stitch-label-sm text-stitch-outline hover:text-stitch-secondary transition-colors underline-offset-4 underline flex items-center gap-1 group"
          >
            Return to Shop
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
