import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@byteevolvr/store';
import { ProductService, Product, MarketingService } from '@byteevolvr/api-client';
import {
  Loader2,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Award,
} from 'lucide-react';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    addItem,
    appliedDiscount,
    setAppliedDiscount,
  } = useCartStore();
  const total = totalAmount();
  const currencySymbol = useStoreCurrency();

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [couponCode, setCouponCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [discountError, setDiscountError] = useState('');

  const handleApplyDiscount = async () => {
    if (!couponCode) return;
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const res = await MarketingService.validateCoupon(couponCode, total);
      if (res.couponId && res.code) {
        setAppliedDiscount({
          code: res.code,
          discount: res.discount,
          couponId: res.couponId,
        });
        setCouponCode('');
      } else {
        setDiscountError(res.message || 'Invalid coupon');
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

  const finalTotalAmount = Math.max(0, total + total * 0.1 - (appliedDiscount?.discount || 0));

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const allProducts = await ProductService.getProducts();
        if (items.length > 0) {
          const cartItemIds = items.map((item) => item.id);
          const cartProducts = allProducts.filter((p) => cartItemIds.includes(p.id!));
          const cartCategories = [...new Set(cartProducts.map((p) => p.category))];

          let related = allProducts.filter(
            (p) => cartCategories.includes(p.category) && !cartItemIds.includes(p.id!)
          );

          if (related.length === 0) {
            related = allProducts.filter((p) => !cartItemIds.includes(p.id!));
          }

          setRelatedProducts(related.slice(0, 4));
        } else {
          // If cart is empty, show some generic recommendations
          setRelatedProducts(allProducts.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      }
    };
    fetchRelated();
  }, [items]);

  if (items.length === 0) {
    return (
      <main className="flex-grow pt-24 pb-stitch-section-gap px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto w-full min-h-[calc(100vh-160px)] flex flex-col">
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <ShoppingCart className="w-16 h-16 text-stitch-outline" />
          <h2 className="text-2xl font-bold text-white">Your Crate is Empty</h2>
          <p className="text-stitch-on-surface-variant">
            Looks like you haven't added any gear yet.
          </p>
          <Link
            to="/shop"
            className="mt-4 bg-stitch-primary text-stitch-on-primary px-8 py-3 rounded-full font-stitch-cta-button hover:brightness-110 transition-all uppercase"
          >
            Explore Shop
          </Link>
        </div>

        {/* Recommended Products for Empty Cart */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 border-t border-stitch-outline-variant/20 pt-12">
            <h3 className="font-stitch-headline-md text-center text-white mb-8 tracking-widest uppercase">
              POPULAR_GEAR_TO_START
            </h3>
            <div className="flex flex-wrap justify-center gap-stitch-gutter">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[240px] stitch-glass-panel rounded-xl p-4 group flex flex-col justify-between"
                >
                  <Link
                    to={`/shop/product/${product.id}`}
                    className="block h-40 bg-stitch-surface rounded mb-4 overflow-hidden cursor-pointer"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={product.image_url || 'https://via.placeholder.com/200'}
                      alt={product.name}
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/shop/product/${product.id}`}
                      className="font-stitch-label-sm text-white text-sm truncate block hover:text-stitch-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="font-stitch-label-sm text-stitch-secondary text-sm mt-2 mb-4">
                      {currencySymbol}
                      {product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => addItem(product)}
                      className="w-full py-2 bg-stitch-primary/20 text-stitch-primary hover:bg-stitch-primary/40 font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <Plus className="w-4 h-4" /> ADD TO CRATE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex-grow pt-24 pb-stitch-section-gap px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto w-full min-h-[calc(100vh-160px)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-stitch-gutter items-start">
        {/* Shopping Cart Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-stitch-gutter">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-stitch-headline-lg text-stitch-headline-lg text-white">
              YOUR_CRATE
            </h2>
            <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
              [ {items.length < 10 ? `0${items.length}` : items.length} Items ]
            </span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="stitch-glass-panel rounded-xl p-stitch-base md:p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group"
            >
              <div className="w-full md:w-48 h-48 bg-stitch-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-stitch-outline-variant/10">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={item.image_url || 'https://via.placeholder.com/150'}
                  alt={item.name}
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile text-stitch-primary">
                      {item.name}
                    </h3>
                    <p className="font-stitch-label-sm text-stitch-headline-lg-mobile text-white">
                      {currencySymbol}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-stitch-body-md text-stitch-on-surface-variant mt-2 line-clamp-2">
                    Premium Tech Gear
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-stitch-secondary animate-pulse"
                      style={{ animationDuration: '2s' }}
                    ></span>
                    <span className="font-stitch-label-sm text-stitch-secondary uppercase">
                      In Stock &amp; Ready for Dispatch
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center border border-stitch-outline-variant/30 rounded-full bg-stitch-surface-container-low px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-2 text-stitch-outline hover:text-stitch-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-stitch-label-sm text-white">
                      {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.max_stock !== undefined && item.quantity >= item.max_stock}
                      className="p-2 text-stitch-outline hover:text-stitch-primary transition-colors disabled:opacity-30"
                      title={
                        item.max_stock !== undefined && item.quantity >= item.max_stock
                          ? 'Max stock reached'
                          : undefined
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="font-stitch-label-sm text-stitch-error hover:text-stitch-error/80 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* You Might Also Like Carousel */}
          {relatedProducts.length > 0 && (
            <div className="pt-8">
              <h3 className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant mb-4 tracking-widest uppercase">
                SYNERGIZE_YOUR_SETUP
              </h3>
              <div className="flex gap-stitch-gutter overflow-x-auto pb-4 stitch-no-scrollbar">
                {relatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[200px] stitch-glass-panel rounded-xl p-4 group flex flex-col justify-between"
                  >
                    <Link
                      to={`/shop/product/${product.id}`}
                      className="block h-32 bg-stitch-surface rounded mb-3 overflow-hidden cursor-pointer"
                    >
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        src={product.image_url || 'https://via.placeholder.com/200'}
                        alt={product.name}
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/shop/product/${product.id}`}
                        className="font-stitch-label-sm text-white text-xs truncate block hover:text-stitch-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="font-stitch-label-sm text-stitch-secondary text-xs mt-1 mb-3">
                        {currencySymbol}
                        {product.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => addItem(product)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-stitch-gutter">
          <div className="stitch-glass-panel rounded-xl p-6 border-stitch-primary/20 bg-stitch-surface-container-high/60">
            <h3 className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile text-white mb-6 uppercase">
              ORDER_MANIFEST
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between font-stitch-body-md text-stitch-on-surface-variant">
                <span>Subtotal</span>
                <span>
                  {currencySymbol}
                  {total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-stitch-body-md text-stitch-on-surface-variant">
                <span>Shipping</span>
                <span className="text-stitch-secondary">FREE</span>
              </div>
              <div className="flex justify-between font-stitch-body-md text-stitch-on-surface-variant">
                <span>Tax (Calculated)</span>
                <span>
                  {currencySymbol}
                  {(total * 0.1).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-stitch-outline-variant/30 pt-6 mb-8">
              {appliedDiscount && (
                <div className="flex justify-between items-baseline mb-4">
                  <span className="font-stitch-body-md text-stitch-primary">Discount</span>
                  <span className="font-stitch-body-md text-stitch-primary">
                    -{currencySymbol}
                    {appliedDiscount.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="font-stitch-headline-lg-mobile text-white">TOTAL</span>
                <span className="font-stitch-display-lg-mobile text-stitch-display-lg-mobile text-stitch-primary">
                  {currencySymbol}
                  {finalTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Input */}
            <div className="mb-8">
              {!appliedDiscount ? (
                <div className="space-y-2">
                  <div className="relative flex items-center bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg p-1 transition-all focus-within:border-stitch-primary focus-within:shadow-[0_0_15px_rgba(173,198,255,0.3)]">
                    <input
                      className="bg-transparent border-none focus:ring-0 font-stitch-label-sm text-stitch-label-sm w-full px-4 text-white placeholder:text-stitch-outline/50 uppercase"
                      placeholder="COUPON_CODE"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !couponCode}
                      className="bg-stitch-surface-variant text-white font-stitch-label-sm text-stitch-label-sm px-4 py-2 rounded-md hover:bg-stitch-outline-variant transition-colors disabled:opacity-50"
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

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/shop/checkout')}
              className="w-full bg-stitch-primary-container text-stitch-on-primary-container font-stitch-cta-button text-stitch-cta-button py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:shadow-[0_0_30px_rgba(77,142,255,0.6)] transition-all active:scale-[0.98] uppercase"
            >
              PROCEED TO CHECKOUT
              <ArrowRight className="w-6 h-6" />
            </button>

            {/* Trust Badges */}
            <div className="mt-8 flex justify-center items-center gap-6">
              <div className="flex flex-col items-center gap-1 opacity-60">
                <ShieldCheck className="w-6 h-6 text-stitch-secondary" />
                <span className="font-stitch-label-sm text-[10px] uppercase text-white">
                  Secure Tx
                </span>
              </div>
              <div className="w-px h-8 bg-stitch-outline-variant/30"></div>
              <div className="flex flex-col items-center gap-1 opacity-60">
                <Lock className="w-6 h-6 text-stitch-secondary" />
                <span className="font-stitch-label-sm text-[10px] uppercase text-white">
                  Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Back to Shopping */}
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 font-stitch-label-sm text-stitch-outline hover:text-stitch-primary transition-colors group uppercase tracking-widest mt-4"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            CONTINUE EXPLORING
          </Link>
        </div>
      </div>
    </main>
  );
}
