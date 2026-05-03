import { clearCart, addOrder } from '@byteevolvr/store';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '@byteevolvr/api-client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useStoreHooks';
import { Button, Input, Card, Badge } from '@byteevolvr/ui';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(total * 0.18);
  const grandTotal = total + gst;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address1) {
      alert('Please fill in required shipping details.');
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === 'razorpay') {
        const razorpayOrder = await createRazorpayOrder(grandTotal * 100, `receipt_${Date.now()}`);
        
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.order.amount,
          currency: 'INR',
          name: 'ByteeVolvr Enterprises',
          description: 'Payment for Technology Products',
          order_id: razorpayOrder.order.id,
          handler: async (response: any) => {
            const verification = await verifyRazorpayPayment(response);
            if (verification.verified) {
              await completeOrder(razorpayOrder.order.id);
            } else {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: formData.name,
            contact: formData.phone,
          },
          theme: {
            color: '#1A4FD6',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await completeOrder(`COD_${Date.now()}`);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('You must be logged in to complete your order.');
      navigate('/login');
      return;
    }

    const response = await createOrder({
      userId: user.id,
      shippingAddress: formData,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        sku: item.sku
      })),
      totalAmount: grandTotal,
    });

    dispatch(
      addOrder({
        id: response.order.id,
        orderNumber: response.order.id.toUpperCase(),
        status: response.order.status,
        totalAmount: grandTotal,
        createdAt: new Date().toISOString(),
        trackingId: response.order.trackingId ?? 'TRK-DEMO-1001',
      })
    );
    dispatch(clearCart());
    navigate('/orders');
  };

  return (
    <main style={{ padding: 'var(--space-12) var(--space-8) var(--space-16)' }}>
      <section style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-10)' }}>
        <div>
          <h1 style={{ fontSize: 44, marginBottom: 'var(--space-8)' }}>Secure Checkout</h1>
          
          <Card style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 24, marginBottom: 'var(--space-6)' }}>Shipping Address</h2>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" required />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" required />
              <Input label="Address line 1" name="address1" value={formData.address1} onChange={handleInputChange} placeholder="House/Flat No, Building Name" required />
              <Input label="Address line 2" name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Street, Locality" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                <Input label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                <Input label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="000000" />
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontSize: 24, marginBottom: 'var(--space-6)' }}>Payment Method</h2>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-4)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)', 
                  border: `1px solid ${paymentMethod === 'razorpay' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: paymentMethod === 'razorpay' ? 'rgba(26, 79, 214, 0.05)' : 'var(--color-surface)',
                  cursor: 'pointer'
                }}
              >
                <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                <div>
                  <div style={{ fontWeight: 600 }}>Razorpay (UPI, Cards, Net Banking)</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Fast and secure payment with all major Indian banks</div>
                </div>
              </label>
              
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-4)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)', 
                  border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: paymentMethod === 'cod' ? 'rgba(26, 79, 214, 0.05)' : 'var(--color-surface)',
                  cursor: 'pointer'
                }}
              >
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Pay when you receive your order</div>
                </div>
              </label>
            </div>
          </Card>
        </div>

        <aside style={{ position: 'sticky', top: 'calc(var(--space-12) + 80px)', height: 'fit-content' }}>
          <Card>
            <h2 style={{ fontSize: 24, marginBottom: 'var(--space-6)' }}>Order Summary</h2>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {cartItems.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>GST (18%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginTop: 'var(--space-4)' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--color-primary-light)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              isLoading={placing}
              disabled={cartItems.length === 0}
              size="lg"
              style={{ width: '100%', marginTop: 'var(--space-8)' }}
            >
              {paymentMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm Order'}
            </Button>
            
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
              🔒 Secure SSL Encrypted Checkout
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}
