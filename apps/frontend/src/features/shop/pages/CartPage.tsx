import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@byteevolvr/store';
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@byteevolvr/ui';

export function CartPage() {
  const { items, removeItem: removeFromCart, updateQuantity, totalAmount } = useCartStore();
  const navigate = useNavigate();

  const subtotal = totalAmount();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = 0; // Free shipping for now to match user expectations
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#04080F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <ShoppingCart className="h-10 w-10 text-brand-muted" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-brand-muted mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our premium tech gear to
          get started.
        </p>
        <Button onClick={() => navigate('/shop')} variant="primary" className="gap-2">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04080F] text-white py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="bg-[#070D1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-brand-muted">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-white/5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    {/* Product Details */}
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/5 rounded-xl flex-shrink-0 p-2 flex items-center justify-center border border-white/10">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-brand-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">
                          Brand
                        </div>
                        <Link
                          to={`/shop/product/${item.id}`}
                          className="font-bold text-white hover:text-accent transition-colors line-clamp-2 leading-tight"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-3 flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price - Hidden on Mobile */}
                    <div className="col-span-2 text-center hidden md:block text-brand-muted font-medium">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                      <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-[#04080F]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-white hover:bg-white/5 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 font-bold text-sm text-white border-x border-white/20 min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-white hover:bg-white/5 transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="col-span-1 md:col-span-2 text-left md:text-right font-bold text-lg text-white">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/shop')}
              className="mt-6 flex items-center gap-2 text-sm text-brand-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </button>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-white font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Estimated Tax (18% GST)</span>
                  <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-brand-muted pb-4 border-b border-white/10">
                  <span>Shipping</span>
                  <span
                    className={
                      shipping === 0 ? 'text-green-400 font-medium' : 'text-white font-medium'
                    }
                  >
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/shop/checkout')}
                variant="primary"
                className="w-full py-4 rounded-xl shadow-[0_0_15px_rgba(26,79,214,0.3)] text-base"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-6 text-xs text-brand-muted text-center flex flex-col gap-2">
                <p>Secure checkout powered by Razorpay</p>
                <div className="flex justify-center gap-2">
                  <div className="px-2 py-1 bg-white/5 rounded border border-white/10">Visa</div>
                  <div className="px-2 py-1 bg-white/5 rounded border border-white/10">
                    Mastercard
                  </div>
                  <div className="px-2 py-1 bg-white/5 rounded border border-white/10">UPI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
