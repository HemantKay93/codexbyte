import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShippingService } from '@byteevolvr/api-client';
import { Button, Input, Card, Badge } from '@byteevolvr/ui';
import { Loader2, PackageSearch } from 'lucide-react';

export function TrackingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialId = id || searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(initialId);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (idToFetch: string) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');

    try {
      const data = await ShippingService.getTrackingById(idToFetch);
      setResult(data);
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch tracking details');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  return (
    <div className="min-h-screen bg-[#04080F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mt-12">
        <div className="text-center mb-10">
          <PackageSearch className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="font-display text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-brand-muted">
            Enter your tracking ID to see the real-time status of your shipment.
          </p>
        </div>

        <div className="flex gap-4 mb-12">
          <div className="flex-1">
            <Input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. TRK-ABC-123"
            />
          </div>
          <Button variant="primary" onClick={() => fetchTracking(trackingId)} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track Status'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-center text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="bg-[#070D1A] border border-white/10 p-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                  <div className="text-sm text-brand-muted uppercase tracking-widest mb-1">
                    Current Status
                  </div>
                  <div className="text-3xl font-bold text-accent">{result.status}</div>
                </div>
                <Badge variant="primary">{result.courierName}</Badge>
              </div>

              <div className="relative pl-8">
                {/* Timeline Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10" />

                <div className="space-y-8">
                  {result.events.map((event: any, i: number) => (
                    <div key={i} className="relative z-10">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 ${
                          i === 0
                            ? 'bg-accent border-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                            : 'bg-[#04080F] border-white/20'
                        }`}
                      />

                      <div
                        className={`font-semibold text-lg ${i === 0 ? 'text-white' : 'text-white/60'}`}
                      >
                        {event.status}
                      </div>
                      <div className="text-sm text-brand-muted mt-1">{event.description}</div>
                      <div className="text-xs text-white/40 mt-2">{event.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
