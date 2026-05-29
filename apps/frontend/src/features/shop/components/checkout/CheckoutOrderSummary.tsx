import { Link } from 'react-router-dom';
import { Loader2, Truck, Lock, Shield, CheckCircle, Award } from 'lucide-react';
import { MarketingService } from '@byteevolvr/api-client';

interface CheckoutOrderSummaryProps {
  items: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  currencySymbol: string;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingRates: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  selectedRate: number;
  setSelectedRate: (rate: number) => void;
  calculatingShipping: boolean;
  finalTotalAmount: number;
  loading: boolean;
  paymentMethod: string;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedDiscount: { code: string; discount: number; couponId: string } | null;
  setAppliedDiscount: (
    discount: { code: string; discount: number; couponId: string } | null
  ) => void;
  discountLoading: boolean;
  setDiscountLoading: (loading: boolean) => void;
  discountError: string;
  setDiscountError: (error: string) => void;
  subtotalForDiscount: number;
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
  couponCode,
  setCouponCode,
  appliedDiscount,
  setAppliedDiscount,
  discountLoading,
  setDiscountLoading,
  discountError,
  setDiscountError,
  subtotalForDiscount,
}: CheckoutOrderSummaryProps) {
  const handleApplyDiscount = async () => {
    if (!couponCode) return;
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const res = await MarketingService.validateCoupon(couponCode, subtotalForDiscount);
      if (res.couponId && res.code) {
        setAppliedDiscount({
          code: res.code,
          discount: res.discount,
          couponId: res.couponId,
        });
        setCouponCode('');
      } else {
        setDiscountError(res.message || 'Invalid coupon');
        // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch (err: any) {
      setDiscountError(
        err.customMessage || err.response?.data?.message || 'Failed to apply coupon'
      );
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
  };
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

          {/* Discount Section */}
          <div className="pt-4 border-t border-stitch-outline-variant/20 mt-4 mb-4">
            {!appliedDiscount ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-stitch-surface-container-lowest border border-stitch-outline-variant/50 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-stitch-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={discountLoading || !couponCode}
                    className="bg-stitch-primary/20 text-stitch-primary hover:bg-stitch-primary/30 px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {discountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                  </button>
                </div>
                {discountError && <p className="text-stitch-error text-xs">{discountError}</p>}
              </div>
            ) : (
              <div className="flex justify-between items-center bg-stitch-primary/10 border border-stitch-primary/30 rounded p-3">
                <div className="flex flex-col">
                  <span className="text-stitch-primary font-bold flex items-center gap-2">
                    <Award className="w-4 h-4" /> {appliedDiscount.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="text-xs text-stitch-outline hover:text-white text-left mt-1 underline"
                  >
                    Remove
                  </button>
                </div>
                <span className="text-stitch-primary font-bold">
                  -{currencySymbol}
                  {appliedDiscount.discount.toFixed(2)}
                </span>
              </div>
            )}
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
