import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const currencySymbol = useStoreCurrency();

  useEffect(() => {
    const timer = setTimeout(() => setIsSuccessAnimated(true), 500);
    const timer2 = setTimeout(() => setIsSuccessAnimated(false), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <main className="flex-grow pt-12 pb-stitch-section-gap px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-5xl mx-auto w-full min-h-[calc(100vh-160px)]">
      {/* Success State Header */}
      <section className="text-center mb-12">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-stitch-secondary/10 border border-stitch-secondary/30 mb-6 glow-success transition-transform duration-300 ${isSuccessAnimated ? 'scale-110' : ''}`}
          style={{ filter: 'drop-shadow(0 0 15px rgba(93, 230, 255, 0.4))' }}
        >
          <span
            className="material-symbols-outlined text-stitch-secondary text-5xl"
            style={{ fontVariationSettings: "'wght' 700" }}
          >
            check_circle
          </span>
        </div>
        <h2 className="font-stitch-display-lg-mobile md:font-stitch-display-lg text-stitch-display-lg-mobile md:text-stitch-display-lg text-stitch-on-surface mb-2 uppercase tracking-tighter">
          Mission Accomplished
        </h2>
        <div className="flex items-center justify-center gap-2 font-stitch-label-sm text-stitch-label-sm text-stitch-secondary tracking-widest uppercase mb-4">
          <span
            className="w-2 h-2 rounded-full bg-stitch-secondary animate-pulse"
            style={{ animationDuration: '2s' }}
          ></span>
          Order Confirmed: #NC-8829
        </div>
        <p className="text-stitch-on-surface-variant max-w-md mx-auto">
          Systems integrated. Your high-performance hardware is being prepared for extraction.
          Welcome to the core.
        </p>
      </section>

      {/* Order Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-stitch-gutter">
        {/* Left Column: Summary */}
        <div className="md:col-span-7 space-y-stitch-gutter">
          <div className="stitch-glass-panel p-8 rounded-xl border border-white/5 bg-stitch-surface-container/20 backdrop-blur-xl">
            <h3 className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile text-stitch-primary mb-6 uppercase">
              Order Manifest
            </h3>

            {/* Items */}
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 bg-stitch-surface-container rounded-lg overflow-hidden border border-stitch-outline-variant/30 shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1611078449942-9aff9c44b958?q=80&w=200&auto=format&fit=crop"
                    alt="Laptop"
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-stitch-headline-lg-mobile text-[18px] text-stitch-on-surface">
                    NEON_LAPTOP X-15
                  </div>
                  <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant uppercase">
                    RTX 4090 / 64GB RAM / 2TB SSD
                  </div>
                </div>
                <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-secondary">
                  {currencySymbol}3,499.00
                </div>
              </div>

              <div className="flex gap-4 items-center pt-6 border-t border-stitch-outline-variant/20">
                <div className="w-20 h-20 bg-stitch-surface-container rounded-lg overflow-hidden border border-stitch-outline-variant/30 shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=200&auto=format&fit=crop"
                    alt="Keyboard"
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-stitch-headline-lg-mobile text-[18px] text-stitch-on-surface">
                    CORE_GLOW TKL
                  </div>
                  <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant uppercase">
                    Mechanical / Optical Switches
                  </div>
                </div>
                <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-secondary">
                  {currencySymbol}189.00
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-8 pt-8 border-t border-stitch-outline-variant/50 space-y-3">
              <div className="flex justify-between font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant">
                <span>SUBTOTAL</span>
                <span>{currencySymbol}3,688.00</span>
              </div>
              <div className="flex justify-between font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant">
                <span>SHIPPING (EXPRESS EXTRACTION)</span>
                <span>{currencySymbol}0.00</span>
              </div>
              <div className="flex justify-between font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile text-stitch-on-surface pt-2">
                <span>TOTAL PAID</span>
                <span className="text-stitch-secondary">{currencySymbol}3,688.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Details */}
        <div className="md:col-span-5 space-y-stitch-gutter">
          {/* Delivery Status */}
          <div className="stitch-glass-panel p-8 rounded-xl border-l-4 border-l-stitch-secondary bg-stitch-surface-container/20 backdrop-blur-xl">
            <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-secondary mb-2 uppercase tracking-widest">
              Expected Deployment
            </div>
            <div className="font-stitch-headline-lg-mobile text-stitch-headline-lg text-stitch-on-surface mb-6">
              OCTOBER 24, 2024
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-stitch-primary">
                  local_shipping
                </span>
                <div>
                  <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface uppercase">
                    Extraction Point
                  </div>
                  <p className="text-stitch-on-surface-variant text-sm">
                    2049 Silicon Valley Blvd,
                    <br />
                    Building 7, Suite 101
                    <br />
                    San Francisco, CA 94103
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-stitch-outline-variant/20">
                <span className="material-symbols-outlined text-stitch-primary">mail</span>
                <div>
                  <div className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface uppercase">
                    Transmission Log
                  </div>
                  <p className="text-stitch-on-surface-variant text-sm">operator@neoncore.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/shop/track')}
              className="w-full bg-stitch-primary hover:bg-stitch-secondary transition-all duration-300 text-stitch-on-primary-container font-stitch-cta-button text-stitch-cta-button py-4 rounded-lg uppercase flex items-center justify-center gap-2 group"
            >
              Track Shipment
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full border border-stitch-outline-variant/50 hover:border-stitch-secondary/50 bg-white/5 hover:bg-white/10 transition-all duration-300 text-stitch-on-surface font-stitch-cta-button text-stitch-cta-button py-4 rounded-lg uppercase"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
