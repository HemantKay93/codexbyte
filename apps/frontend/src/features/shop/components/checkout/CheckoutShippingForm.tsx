import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CheckoutShippingFormProps {
  user: any;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
  guestPassword: string;
  setGuestPassword: (password: string) => void;
  shippingAddress: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CheckoutShippingForm({
  user,
  guestEmail,
  setGuestEmail,
  guestPassword,
  setGuestPassword,
  shippingAddress,
  handleInputChange,
}: CheckoutShippingFormProps) {
  const navigate = useNavigate();

  return (
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
              onClick={() => navigate('/auth/login', { state: { returnTo: '/shop/checkout' } })}
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
  );
}
