import { CreditCard, Banknote } from 'lucide-react';

interface CheckoutPaymentMethodProps {
  paymentMethod: 'razorpay' | 'cod';
  setPaymentMethod: (method: 'razorpay' | 'cod') => void;
}

export function CheckoutPaymentMethod({
  paymentMethod,
  setPaymentMethod,
}: CheckoutPaymentMethodProps) {
  return (
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
  );
}
