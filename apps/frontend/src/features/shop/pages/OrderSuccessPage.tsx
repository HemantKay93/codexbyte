import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@byteevolvr/ui';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

export function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const currencySymbol = useStoreCurrency();
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const { orderId, orderNumber, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId && !orderNumber) {
      void navigate('/shop', { replace: true });
    }
    const timer = setTimeout(() => setIsSuccessAnimated(true), 500);
    const timer2 = setTimeout(() => setIsSuccessAnimated(false), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [orderId, orderNumber, navigate]);

  return (
    <div className="min-h-screen bg-[#04080F] text-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div
          className={`w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 ${isSuccessAnimated ? 'scale-110' : ''}`}
          style={{ filter: 'drop-shadow(0 0 15px rgba(34,197,94,0.3))' }}
        >
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-display font-bold mb-3">Order Confirmed!</h1>
        <p className="text-brand-muted mb-2">
          {paymentMethod === 'cod'
            ? 'Your order has been placed. Pay when it arrives.'
            : 'Payment received. Your order is being processed.'}
        </p>
        {orderNumber && <p className="text-sm font-mono text-accent mb-8">Order #{orderNumber}</p>}

        {/* Info Cards */}
        <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
          <div className="flex items-center gap-3 text-sm text-brand-muted">
            <Package className="h-5 w-5 text-accent shrink-0" />
            <span>You&apos;ll receive an email with tracking details once your order ships.</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-brand-muted">
            <MapPin className="h-5 w-5 text-accent shrink-0" />
            <span>Track your shipment anytime from your dashboard or the tracking page.</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => void navigate('/shop/dashboard')}
            variant="primary"
            className="gap-2"
          >
            View My Orders <ArrowRight className="h-4 w-4" />
          </Button>
          {orderId && (
            <Link to={`/shop/track/${orderId}`}>
              <Button variant="secondary" className="w-full sm:w-auto border border-white/20">
                Track Order
              </Button>
            </Link>
          )}
          <Button
            onClick={() => void navigate('/shop')}
            variant="ghost"
            className="border border-white/10"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Fallback hint */}
        <p className="mt-8 text-xs text-brand-muted opacity-50">
          {currencySymbol} — all prices are inclusive of applicable taxes.
        </p>
      </div>
    </div>
  );
}
