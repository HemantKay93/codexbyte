import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@byteevolvr/store';
import { OrderService, ShippingService, UserService, PaymentService } from '@byteevolvr/api-client';

declare global {
  interface Window {
    Razorpay: any;
    // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

import { CheckoutProgressIndicator } from '../components/checkout/CheckoutProgressIndicator';
import { CheckoutShippingForm } from '../components/checkout/CheckoutShippingForm';
import { CheckoutPaymentMethod } from '../components/checkout/CheckoutPaymentMethod';
import { CheckoutOrderSummary } from '../components/checkout/CheckoutOrderSummary';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

export function CheckoutPage() {
  const { items, clearCart, totalAmount, appliedDiscount, setAppliedDiscount } = useCartStore();
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
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedRate, setSelectedRate] = useState<number>(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

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
              // eslint-disable-line @typescript-eslint/no-explicit-any
              data.rates[0]
            );
            setSelectedRate(cheapest.rate);
          } else if (data.data?.available_courier_companies) {
            // Shiprocket format
            const rates = data.data.available_courier_companies.map((c: any) => ({
              // eslint-disable-line @typescript-eslint/no-explicit-any
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

    void fetchRates();
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
    void fetchLatestAddress();
  }, [user]);

  const tax = subtotal * 0.18; // 18% GST
  const shipping = selectedRate;
  const discountAmount = appliedDiscount?.discount || 0;
  const finalTotalAmount = Math.max(0, subtotal + tax + shipping - discountAmount);

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    navigate('/shop/cart');
    // eslint-disable-line @typescript-eslint/no-floating-promises
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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
        discountAmount: appliedDiscount?.discount || 0,
        couponCode: appliedDiscount?.code,
        couponId: appliedDiscount?.couponId,
        totalAmount: finalTotalAmount,
      };

      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Are you online?');
        }

        // Generate Razorpay Order
        const rzpOrderData = await PaymentService.createRazorpayOrder({
          items: payload.items,
          receipt: `rcpt_${Date.now()}`,
          shippingFee: selectedRate,
          discountAmount: appliedDiscount?.discount || 0,
        });

        if (!rzpOrderData || !rzpOrderData.order) {
          throw new Error('Failed to create Razorpay order');
        }

        const options = {
          key: rzpOrderData.key,
          amount: rzpOrderData.order.amount,
          currency: rzpOrderData.order.currency,
          name: 'ByteEvolvr',
          description: 'Order Checkout',
          order_id: rzpOrderData.order.id,
          handler: async function (response: any) {
            // eslint-disable-line @typescript-eslint/no-explicit-any
            try {
              const verified = await PaymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verified?.verified) {
                // Now create the actual order in our system
                await OrderService.createOrder({
                  ...payload,
                  status: 'confirmed',
                });
                clearCart();
                navigate('/shop/order-success');
                // eslint-disable-line @typescript-eslint/no-floating-promises
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (err: any) {
              // eslint-disable-line @typescript-eslint/no-explicit-any
              console.error('Payment verification error', err);
              setError(
                'Payment verification failed. Please contact support if amount was deducted.'
              );
              setLoading(false);
            }
          },
          prefill: {
            name: shippingAddress.full_name,
            email: user?.email || guestEmail,
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#0f172a',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        // eslint-disable-line @typescript-eslint/no-explicit-any
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // COD logic
        await OrderService.createOrder(payload);
        clearCart();
        // eslint-disable-line @typescript-eslint/no-floating-promises
        navigate('/shop/order-success');
      }
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Order creation failed:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <main className="pt-24 pb-stitch-section-gap px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto w-full min-h-[calc(100vh-160px)]">
        <CheckoutProgressIndicator />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-stitch-error/10 border border-stitch-error/20 text-stitch-error text-sm">
            {error}
          </div>
        )}

        <form
          id="checkout-form"
          onSubmit={(e) => void handlePlaceOrder(e)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-stitch-gutter items-start"
        >
          {/* Left Column: Checkout Forms */}
          <section className="lg:col-span-8 space-y-stitch-gutter">
            <CheckoutShippingForm
              user={user}
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
              guestPassword={guestPassword}
              setGuestPassword={setGuestPassword}
              shippingAddress={shippingAddress}
              handleInputChange={handleInputChange}
            />

            <CheckoutPaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </section>

          {/* Right Column: Order Summary Sidebar */}
          <CheckoutOrderSummary
            items={items}
            currencySymbol={currencySymbol}
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            shippingRates={shippingRates}
            selectedRate={selectedRate}
            setSelectedRate={setSelectedRate}
            calculatingShipping={calculatingShipping}
            finalTotalAmount={finalTotalAmount}
            loading={loading}
            paymentMethod={paymentMethod}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            discountLoading={discountLoading}
            setDiscountLoading={setDiscountLoading}
            discountError={discountError}
            setDiscountError={setDiscountError}
            subtotalForDiscount={subtotal}
          />
        </form>
      </main>
    </div>
  );
}
