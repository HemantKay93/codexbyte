import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@byteevolvr/store';
import { OrderService, ShippingService, UserService } from '@byteevolvr/api-client';
import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';
import {
  Loader2,
  CreditCard,
  Banknote,
  Truck,
  Lock,
  Shield,
  CheckCircle,
  Award,
} from 'lucide-react';
export function CheckoutPage() {
  const { items, clearCart, totalAmount } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const currencySymbol = useStoreCurrency();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    phone: '',
    line_1: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');

  const subtotal = totalAmount();

  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<number>(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  React.useEffect(() => {
    const fetchRates = async () => {
      if (shippingAddress.postal_code.length === 6) {
        setCalculatingShipping(true);
        try {
          const data = await ShippingService.calculateShippingRates({
            pincode: shippingAddress.postal_code,
            weight: 1, // Default weight
            subtotal,
          });

          if (data.rates && data.rates.length > 0) {
            setShippingRates(data.rates);
            // Default to cheapest rate
            const cheapest = data.rates.reduce(
              (min: any, r: any) => (r.rate < min.rate ? r : min),
              data.rates[0]
            );
            setSelectedRate(cheapest.rate);
          } else if (data.data?.available_courier_companies) {
            // Shiprocket format
            const rates = data.data.available_courier_companies.map((c: any) => ({
              courier_name: c.courier_name,
              rate: Number(c.rate),
              estimated_delivery_days: c.estimated_delivery_days,
            }));
            setShippingRates(rates);
            setSelectedRate(rates[0]?.rate || 0);
          }
        } catch (err) {
          console.error('Failed to fetch shipping rates', err);
        } finally {
          setCalculatingShipping(false);
        }
      } else {
        setShippingRates([]);
        setSelectedRate(0);
      }
    };

    fetchRates();
  }, [shippingAddress.postal_code, subtotal]);

  React.useEffect(() => {
    async function fetchLatestAddress() {
      if (!user) return;
      try {
        const response = await UserService.getAddresses();
        const data = response.data?.[0];

        if (data) {
          setShippingAddress((prev) => ({
            ...prev,
            full_name: data.full_name || prev.full_name,
            phone: data.phone || prev.phone,
            line_1: data.line_1 || prev.line_1,
            city: data.city || prev.city,
            state: data.state || prev.state,
            postal_code: data.postal_code || prev.postal_code,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch latest address', err);
      }
    }
    fetchLatestAddress();
  }, [user]);

  const tax = subtotal * 0.18; // 18% GST
  const shipping = selectedRate;
  const finalTotalAmount = subtotal + tax + shipping;

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    navigate('/shop/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const payload = {
        userId: user?.id,
        email: !user ? guestEmail : undefined,
        password: !user ? guestPassword : undefined,
        items: items.map((item) => ({
          productId: item.id!,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        shippingFee: selectedRate,
        totalAmount: finalTotalAmount,
      };

      await OrderService.createOrder(payload);

      if (paymentMethod === 'razorpay') {
        alert('Payment integration pending. Order placed successfully!');
      }

      clearCart();
      navigate('/shop/order-success');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      );
      // optionally navigate to order-failed instead
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <main className="pt-24 pb-stitch-section-gap px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto w-full min-h-[calc(100vh-160px)]">
        {/* Progress Indicator */}
        <nav className="mb-12 flex justify-center md:justify-start items-center gap-4 md:gap-12">
          <div className="flex items-center gap-3 text-stitch-primary border-b-2 border-stitch-primary pb-2 px-1">
            <span className="font-stitch-label-sm text-stitch-label-sm">01</span>
            <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
              Address
            </span>
          </div>
          <div className="h-[1px] w-8 md:w-16 bg-stitch-outline-variant/30"></div>
          <div className="flex items-center gap-3 text-stitch-outline pb-2 px-1">
            <span className="font-stitch-label-sm text-stitch-label-sm">02</span>
            <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
              Payment
            </span>
          </div>
          <div className="h-[1px] w-8 md:w-16 bg-stitch-outline-variant/30"></div>
          <div className="flex items-center gap-3 text-stitch-outline pb-2 px-1">
            <span className="font-stitch-label-sm text-stitch-label-sm">03</span>
            <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
              Review
            </span>
          </div>
        </nav>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-stitch-error/10 border border-stitch-error/20 text-stitch-error text-sm">
            {error}
          </div>
        )}

        <form
          id="checkout-form"
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-stitch-gutter items-start"
        >
          {/* Left Column: Checkout Forms */}
          <section className="lg:col-span-8 space-y-stitch-gutter">
            {/* Shipping Form */}
            <div className="stitch-glass-panel p-8 rounded-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-stitch-headline-lg text-stitch-headline-lg text-white">
                  SHIPPING_INFO
                </h2>
                <span className="text-stitch-secondary font-stitch-label-sm text-stitch-label-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stitch-secondary animate-pulse"></span>
                  SECURE_ENCRYPTION_ACTIVE
                </span>
              </div>

              {!user && (
                <div className="mb-6 space-y-2 md:col-span-2 bg-stitch-primary/5 p-4 rounded-xl border border-stitch-primary/20">
                  <h3 className="font-bold text-stitch-primary mb-2">Guest Checkout</h3>
                  <p className="text-sm text-stitch-on-surface-variant mb-4">
                    We'll automatically create an account for you so you can track your order.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                        Create Password
                      </label>
                      <input
                        required
                        type="password"
                        value={guestPassword}
                        onChange={(e) => setGuestPassword(e.target.value)}
                        className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-stitch-on-surface-variant mt-3">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/auth/login', { state: { returnTo: '/shop/checkout' } })
                      }
                      className="text-stitch-primary hover:underline"
                    >
                      Log in here
                    </button>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    Full Name
                  </label>
                  <input
                    required
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleInputChange}
                    autoComplete="name"
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    Phone
                  </label>
                  <input
                    required
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    Address Line 1
                  </label>
                  <input
                    required
                    name="line_1"
                    value={shippingAddress.line_1}
                    onChange={handleInputChange}
                    autoComplete="shipping street-address"
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="123 Vector Drive"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    City
                  </label>
                  <input
                    required
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    autoComplete="shipping address-level2"
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="Neo Tokyo"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    State
                  </label>
                  <input
                    required
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase">
                    Zip Code
                  </label>
                  <input
                    required
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleInputChange}
                    autoComplete="shipping postal-code"
                    className="w-full bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 rounded-lg py-3 px-4 focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none transition-all placeholder:text-stitch-outline-variant/50 text-white"
                    placeholder="101-0021"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="stitch-glass-panel p-8 rounded-xl">
              <h2 className="font-stitch-headline-lg text-stitch-headline-lg text-white mb-8">
                PAYMENT_GATEWAY
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`group relative p-6 rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border border-stitch-primary bg-stitch-primary/10 shadow-[0_0_15px_rgba(173,198,255,0.2)]' : 'border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest hover:border-stitch-primary/50'}`}
                >
                  <div className="flex flex-col gap-4">
                    <CreditCard
                      className={`w-8 h-8 ${paymentMethod === 'razorpay' ? 'text-stitch-primary' : 'text-stitch-on-surface-variant group-hover:text-stitch-primary transition-colors'}`}
                    />
                    <span className="font-stitch-cta-button text-stitch-cta-button text-white">
                      Online Payment (Cards, UPI)
                    </span>
                  </div>
                  {paymentMethod === 'razorpay' && (
                    <div className="absolute top-4 right-4 h-4 w-4 rounded-full border-2 border-stitch-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-stitch-primary"></div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`group relative p-6 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border border-stitch-primary bg-stitch-primary/10 shadow-[0_0_15px_rgba(173,198,255,0.2)]' : 'border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest hover:border-stitch-primary/50'}`}
                >
                  <div className="flex flex-col gap-4">
                    <Banknote
                      className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-stitch-primary' : 'text-stitch-on-surface-variant group-hover:text-stitch-primary transition-colors'}`}
                    />
                    <span className="font-stitch-cta-button text-stitch-cta-button text-white">
                      Cash on Delivery
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="absolute top-4 right-4 h-4 w-4 rounded-full border-2 border-stitch-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-stitch-primary"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Order Summary Sidebar */}
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
                  <p className="font-stitch-body-md text-stitch-body-md text-white">
                    3-5 Business Days
                  </p>
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
        </form>
      </main>
    </div>
  );
}
