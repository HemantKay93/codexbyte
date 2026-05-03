import { removeFromCart, updateQuantity } from '@byteevolvr/store';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useStoreHooks';
import { Button, Card, Badge } from '@byteevolvr/ui';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main style={{ padding: 'var(--space-12) var(--space-8) var(--space-16)' }}>
      <section style={{ maxWidth: 1180, margin: '0 auto' }}>
        <h1 style={{ fontSize: 44, marginBottom: 'var(--space-8)' }}>Shopping Cart</h1>
        
        {items.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🛒</div>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr', gap: 'var(--space-10)' }}>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {items.map((item) => (
                <Card key={item.productId} padding={false} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 'var(--space-6)', padding: 'var(--space-4)' }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: 22, marginBottom: 'var(--space-1)' }}>{item.name}</h2>
                    <div style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: 18, marginBottom: 'var(--space-4)' }}>
                      {formatPrice(item.price)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <label style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Quantity:</label>
                      <select
                        value={item.quantity}
                        onChange={(event) =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: Number(event.target.value),
                            })
                          )
                        }
                        style={{ 
                          padding: 'var(--space-2) var(--space-4)', 
                          borderRadius: 'var(--radius-md)', 
                          background: 'var(--color-surface)', 
                          color: '#fff',
                          border: '1px solid var(--color-border)',
                          outline: 'none'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 10].map((qty) => (
                          <option key={qty} value={qty}>
                            {qty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', padding: 'var(--space-2) 0' }}>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{formatPrice(item.price * item.quantity)}</div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      style={{ 
                        background: 'none', 
                        color: 'var(--color-error)', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>✕</span> Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <aside style={{ height: 'fit-content', position: 'sticky', top: 'calc(var(--space-12) + 80px)' }}>
              <Card>
                <h2 style={{ fontSize: 24, marginBottom: 'var(--space-6)' }}>Order Summary</h2>
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>Shipping</span>
                    <Badge variant="success">Free</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 14 }}>
                    <span>Estimated Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 24, marginTop: 'var(--space-4)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--color-primary-light)' }}>{formatPrice(total)}</span>
                  </div>
                  
                  <Link to="/checkout" style={{ textDecoration: 'none', marginTop: 'var(--space-6)' }}>
                    <Button variant="primary" size="lg" style={{ width: '100%' }}>
                      Proceed to Checkout
                    </Button>
                  </Link>
                  
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
                    Prices inclusive of all regional taxes
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
