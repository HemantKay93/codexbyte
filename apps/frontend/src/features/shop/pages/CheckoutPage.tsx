import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@byteevolvr/store';
import { OrderService, ShippingService, UserService } from '@byteevolvr/api-client';
import { ArrowLeft, Loader2, CreditCard, Banknote, MapPin, Truck } from 'lucide-react';
import { Button } from '@byteevolvr/ui';

export function CheckoutPage() {
  const { items, clearCart, totalAmount } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
        // In a real implementation, you would open the Razorpay popup here
        // using the order ID returned from the backend.
        // For now, we simulate a successful payment.
        alert('Payment integration pending. Order placed successfully!');
      }

      clearCart();
      navigate('/shop/dashboard', { state: { orderPlaced: true } });
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04080F] text-white py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <button
          onClick={() => navigate('/shop/cart')}
          className="flex items-center gap-2 text-sm text-brand-muted hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Checkout Form */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Checkout</h1>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping Address Section */}
              <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!user && (
                    <>
                      <div className="space-y-2 md:col-span-2 bg-accent/5 p-4 rounded-xl border border-accent/20 mb-2">
                        <h3 className="font-bold text-accent mb-2">Guest Checkout</h3>
                        <p className="text-sm text-brand-muted mb-4">
                          We'll automatically create an account for you so you can track your order.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                              Email Address
                            </label>
                            <input
                              required
                              type="email"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-[#04080F] py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                              placeholder="you@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                              Create Password
                            </label>
                            <input
                              required
                              type="password"
                              value={guestPassword}
                              onChange={(e) => setGuestPassword(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-[#04080F] py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                              placeholder="••••••••"
                              minLength={6}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-brand-muted mt-3">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() =>
                              navigate('/auth/login', { state: { returnTo: '/shop/checkout' } })
                            }
                            className="text-accent hover:underline"
                          >
                            Log in here
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      Full Name
                    </label>
                    <input
                      required
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      Phone Number
                    </label>
                    <input
                      required
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      Address Line
                    </label>
                    <input
                      required
                      name="line_1"
                      value={shippingAddress.line_1}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="Flat No, Building, Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      City
                    </label>
                    <input
                      required
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      State
                    </label>
                    <input
                      required
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-subtle ml-1">
                      Pincode
                    </label>
                    <input
                      required
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-white/30 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all ${paymentMethod === 'razorpay' ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(26,79,214,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-accent' : 'border-white/30'}`}
                    >
                      {paymentMethod === 'razorpay' && (
                        <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                      )}
                    </div>
                    <CreditCard className="h-6 w-6 text-brand-muted" />
                    <div>
                      <div className="font-bold">Online Payment</div>
                      <div className="text-xs text-brand-muted">Cards, UPI, Netbanking</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all ${paymentMethod === 'cod' ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(26,79,214,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-accent' : 'border-white/30'}`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                      )}
                    </div>
                    <Banknote className="h-6 w-6 text-brand-muted" />
                    <div>
                      <div className="font-bold">Cash on Delivery</div>
                      <div className="text-xs text-brand-muted">Pay when you receive</div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Review Order</h2>

              {/* Mini Item List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-white/5 rounded-md flex-shrink-0 flex items-center justify-center border border-white/10">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="max-w-full max-h-full object-contain p-1"
                          />
                        ) : null}
                      </div>
                      <span className="truncate text-brand-muted">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm mb-6 border-t border-white/10 pt-6">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>GST (18%)</span>
                  <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-brand-muted pb-4 border-b border-white/10">
                  <div className="flex flex-col">
                    <span>Shipping</span>
                    {shippingRates.length > 0 && (
                      <select
                        value={selectedRate}
                        onChange={(e) => setSelectedRate(Number(e.target.value))}
                        className="text-[10px] bg-transparent border-none text-accent focus:ring-0 p-0 cursor-pointer"
                      >
                        {shippingRates.map((r, i) => (
                          <option key={i} value={r.rate} className="bg-[#070D1A] text-white">
                            {r.courier_name} (₹{r.rate})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <span
                    className={
                      shipping === 0 ? 'text-green-400 font-medium' : 'text-white font-medium'
                    }
                  >
                    {calculatingShipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : shipping === 0 ? (
                      'Free'
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-display font-bold text-white pt-2">
                  <span>Total</span>
                  <span className="text-accent">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={loading}
                variant="primary"
                className="w-full py-4 rounded-xl shadow-[0_0_15px_rgba(26,79,214,0.3)] text-base flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Truck className="h-5 w-5" />
                )}
                {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
