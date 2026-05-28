import { Link } from 'react-router-dom';
import { Loader2, Truck, Lock, Shield, CheckCircle, Award } from 'lucide-react';

interface CheckoutOrderSummaryProps {
  items: any[];
  currencySymbol: string;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingRates: any[];
  selectedRate: number;
  setSelectedRate: (rate: number) => void;
  calculatingShipping: boolean;
  finalTotalAmount: number;
  loading: boolean;
  paymentMethod: string;
}

export function CheckoutOrderSummary({
  items,
  currencySymbol,
  subtotal,
  tax,
  shipping,
  shippingRates,
  selectedRate,
  setSelectedRate,
  calculatingShipping,
  finalTotalAmount,
  loading,
  paymentMethod,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="lg:col-span-4 sticky top-24 space-y-stitch-gutter">
      <div className="stitch-glass-panel p-8 rounded-xl overflow-hidden relative">
        {/* Subtle Glow Ornament */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-stitch-primary/10 blur-[60px] rounded-full"></div>

        <h2 className="font-stitch-headline-lg text-stitch-headline-lg text-white mb-6 relative z-10">
          ORDER_SUMMARY
        </h2>

        {/* Product Teaser(s) */}
        <div className="space-y-4 mb-8 max-h-60 overflow-y-auto stitch-no-scrollbar relative z-10">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-lg bg-stitch-surface-container-lowest border border-stitch-outline-variant/10"
            >
              <div className="w-20 h-20 bg-stitch-surface-variant rounded flex-shrink-0 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-all duration-500"
                  src={item.image_url || 'https://via.placeholder.com/150'}
                  alt={item.name}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-stitch-cta-button text-stitch-cta-button text-white">
                  {item.quantity}x {item.name}
                </h3>
                <p className="font-stitch-label-sm text-stitch-label-sm text-stitch-primary mt-1">
                  {currencySymbol}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 font-stitch-body-md text-stitch-body-md border-b border-stitch-outline-variant/20 pb-6 mb-6 relative z-10">
          <div className="flex justify-between">
            <span className="text-stitch-outline">Subtotal</span>
            <span className="text-white">
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-stitch-outline">Shipping</span>
              {shippingRates.length > 0 && (
                <select
                  value={selectedRate}
                  onChange={(e) => setSelectedRate(Number(e.target.value))}
                  className="text-[10px] bg-transparent border-none text-stitch-secondary focus:ring-0 p-0 cursor-pointer w-32"
                >
                  {shippingRates.map((r, i) => (
                    <option
                      key={i}
                      value={r.rate}
                      className="bg-stitch-surface-container text-white"
                    >
                      {r.courier_name} ({currencySymbol}
                      {r.rate})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <span className="text-stitch-secondary">
              {calculatingShipping ? (
                <Loader2 className="h-4 w-4 animate-spin text-stitch-secondary" />
              ) : shipping === 0 ? (
                'FREE'
              ) : (
                `${currencySymbol}${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stitch-outline">Estimated Tax (18%)</span>
            <span className="text-white">
              {currencySymbol}
              {tax.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Date Badge */}
        <div className="flex items-center gap-3 p-4 bg-stitch-secondary-container/10 border border-stitch-secondary/20 rounded-lg mb-8 relative z-10">
          <Truck className="w-6 h-6 text-stitch-secondary" />
          <div>
            <p className="font-stitch-label-sm text-stitch-label-sm text-stitch-secondary-fixed-dim uppercase font-bold">
              Estimated Delivery
            </p>
            <p className="font-stitch-body-md text-stitch-body-md text-white">3-5 Business Days</p>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-end mb-8 relative z-10">
          <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile text-white">
            TOTAL
          </span>
          <div className="text-right">
            <span className="font-stitch-display-lg-mobile text-stitch-display-lg-mobile text-stitch-primary">
              {currencySymbol}
              {finalTotalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Terms and Checkout */}
        <div className="space-y-6 relative z-10">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              required
              className="mt-1 bg-stitch-surface-container-lowest border-stitch-outline-variant/50 text-stitch-primary focus:ring-stitch-primary rounded"
              type="checkbox"
            />
            <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline leading-tight group-hover:text-white transition-colors">
              I AGREE TO THE{' '}
              <Link
                to="/legal/terms"
                target="_blank"
                className="text-stitch-primary hover:underline hover:text-stitch-secondary"
              >
                TERMS OF SERVICE
              </Link>{' '}
              AND{' '}
              <Link
                to="/legal/refund"
                target="_blank"
                className="text-stitch-primary hover:underline hover:text-stitch-secondary"
              >
                REFUND POLICY
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stitch-primary text-stitch-on-primary font-stitch-cta-button text-stitch-cta-button rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(173,198,255,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5 fill-current" />
            )}
            {paymentMethod === 'cod' ? 'PLACE ORDER' : 'CONTINUE TO SECURE PAYMENT'}
          </button>
        </div>
      </div>

      {/* Secondary Trust Badge */}
      <div className="flex justify-center gap-8 py-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all text-white">
        <Shield className="w-10 h-10" />
        <CheckCircle className="w-10 h-10" />
        <Award className="w-10 h-10" />
      </div>
    </aside>
  );
}
