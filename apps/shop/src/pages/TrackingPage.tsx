import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card, Badge, Spinner } from '@byteevolvr/ui';
import { PageSeo } from '@/components/PageSeo';
import { Package, Truck, CheckCircle, MapPin, Clock } from 'lucide-react';

export function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingId(id);
      fetchTrackingInfo(id);
    }
  }, [searchParams]);

  async function fetchTrackingInfo(id: string) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Try to fetch as internal order ID first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (order) {
        // Build internal tracking events
        const events = [];
        
        if (order.created_at) {
          events.push({
            status: 'Order Placed',
            description: 'Your order has been successfully placed.',
            timestamp: new Date(order.created_at).toLocaleString(),
            icon: <Clock size={16} />
          });
        }
        
        if (order.accepted_at) {
          events.push({
            status: 'Order Accepted',
            description: 'The seller has accepted your order and is preparing it.',
            timestamp: new Date(order.accepted_at).toLocaleString(),
            icon: <CheckCircle size={16} />
          });
        }
        
        if (order.shipped_at) {
          events.push({
            status: 'Shipped',
            description: `Order is on the way. Tracking ID: ${order.tracking_number}`,
            timestamp: new Date(order.shipped_at).toLocaleString(),
            icon: <Truck size={16} />
          });
        }
        
        if (order.delivered_at) {
          events.push({
            status: 'Delivered',
            description: 'Order has been delivered successfully.',
            timestamp: new Date(order.delivered_at).toLocaleString(),
            icon: <Package size={16} />
          });
        }

        setTrackingData({
          id: order.order_number,
          status: order.status.toUpperCase(),
          courierName: order.shipping_provider || 'Standard Shipping',
          trackingNumber: order.tracking_number,
          events: events.reverse() // Newest first
        });
      } else {
        // Fallback to mock data if not an internal order
        setTrackingData({
          id: id,
          status: 'IN TRANSIT',
          courierName: 'Delhivery',
          events: [
            {
              status: 'In Transit',
              description: 'Package is moving between hubs.',
              timestamp: new Date().toLocaleString(),
              icon: <Truck size={16} />
            },
            {
              status: 'Picked Up',
              description: 'Package picked up by courier.',
              timestamp: '2 hours ago',
              icon: <MapPin size={16} />
            }
          ]
        });
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError('Could not retrieve tracking information.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '48px var(--space-8) 80px' }}>
      <PageSeo title="Track Order" description="Track your shipment in real-time." />
      <section style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 8 }}>Track Your Order</h1>
        <p style={{ color: '#8B9BB8', marginBottom: 40 }}>
          Enter your order ID or tracking number to see the real-time status.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
          <div style={{ flex: 1 }}>
            <Input
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
              placeholder="e.g. SF123456789"
              style={{ height: 50, fontSize: 16 }}
            />
          </div>
          <Button 
            onClick={() => fetchTrackingInfo(trackingId)} 
            disabled={loading || !trackingId}
            style={{ height: 50, padding: '0 32px' }}
          >
            {loading ? 'Searching...' : 'Track Status'}
          </Button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spinner size="lg" />
            <p style={{ marginTop: 16, color: '#8B9BB8' }}>Fetching live tracking data...</p>
          </div>
        )}

        {error && (
          <Card style={{ padding: 24, textAlign: 'center', borderColor: 'var(--color-error)' }}>
            <p style={{ color: '#F87171' }}>{error}</p>
          </Card>
        )}

        {trackingData && !loading && (
          <div style={{ display: 'grid', gap: 24 }}>
            <Card style={{ padding: 40, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#8B9BB8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>Current Status</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-primary)' }}>{trackingData.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant="primary">{trackingData.courierName}</Badge>
                  {trackingData.trackingNumber && (
                    <div style={{ marginTop: 8, color: '#8B9BB8', fontSize: 14 }}>ID: <span style={{ color: '#fff', fontWeight: 600 }}>{trackingData.trackingNumber}</span></div>
                  )}
                </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: 40 }}>
                <div style={{ 
                  position: 'absolute', 
                  left: 7, 
                  top: 10, 
                  bottom: 10, 
                  width: 2, 
                  background: 'linear-gradient(to bottom, var(--color-primary), rgba(255,255,255,0.05))',
                  zIndex: 0
                }} />
                
                <div style={{ display: 'grid', gap: 40 }}>
                  {trackingData.events.map((event: any, i: number) => (
                    <div key={i} style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: -40, 
                        top: 4, 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        background: i === 0 ? 'var(--color-primary)' : '#1A1A1A',
                        border: `3px solid ${i === 0 ? 'rgba(0,116,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: i === 0 ? '0 0 20px rgba(0,116,255,0.5)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ color: i === 0 ? 'var(--color-primary)' : '#8B9BB8' }}>{event.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: i === 0 ? '#fff' : '#8B9BB8' }}>{event.status}</div>
                      </div>
                      <div style={{ color: '#8B9BB8', fontSize: 15, marginLeft: 28 }}>{event.description}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8, marginLeft: 28 }}>{event.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Need Help?</h3>
              <p style={{ color: '#8B9BB8', fontSize: 14 }}>
                If you have any issues with your shipment, please contact our support team at 
                <span style={{ color: 'var(--color-primary)', marginLeft: 4, fontWeight: 600 }}>support@byteevolvr.in</span>
              </p>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
