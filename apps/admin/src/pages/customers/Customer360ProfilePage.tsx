import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, Activity, Heart, IndianRupee, Clock, Ticket, Briefcase } from 'lucide-react';
import { CRMService } from '@byteevolvr/api-client';

export function Customer360ProfilePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) fetchProfile(id);
  }, [id]);

  const fetchProfile = async (customerId: string) => {
    try {
      const res = await CRMService.getCustomer360(customerId);
      setProfile(res.data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !profile.customer) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-on-surface-variant">
        Customer not found
      </div>
    );
  }

  const { customer, metrics, supportSummary, timeline, openDeals } = profile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            {customer.email} • {customer.phone || 'No Phone'}
          </p>
        </div>
        <Button variant="outline" className="gap-2">Edit Customer</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Health & Value
            </h2>
            <div className="space-y-5">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Health Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metrics?.health_score > 70 ? 'bg-green-500' : metrics?.health_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, metrics?.health_score || 0))}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{metrics?.health_score || 0}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <p className="text-sm text-on-surface-variant mb-1">Lifetime Value (LTV)</p>
                <p className="text-2xl font-bold flex items-center text-primary">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {Number(metrics?.lifetime_value || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" /> Support Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <p className="text-3xl font-bold text-on-surface">{supportSummary?.open || 0}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">Open</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <p className="text-3xl font-bold text-on-surface">{supportSummary?.resolved || 0}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">Resolved</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Open Deals
            </h2>
            {openDeals?.length > 0 ? (
              <div className="space-y-3">
                {openDeals.map((deal: any) => (
                  <div key={deal.id} className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
                    <p className="font-semibold text-sm line-clamp-1">{deal.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium px-2 py-1 bg-surface-container rounded-md">
                        {deal.stage_name}
                      </span>
                      <span className="text-sm font-bold text-primary flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {Number(deal.value).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic">No open deals.</p>
            )}
            <Button variant="ghost" className="w-full mt-4 text-primary">View All Deals</Button>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden flex flex-col h-[800px]">
            <div className="p-6 border-b border-outline-variant shrink-0 bg-surface">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Unified Activity Timeline
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest custom-scrollbar">
              {timeline?.length > 0 ? (
                <div className="relative border-l-2 border-outline-variant ml-4 space-y-8">
                  {timeline.map((event: any) => (
                    <div key={event.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                      <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold px-2 py-1 uppercase tracking-wide bg-surface-container rounded-md text-primary">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.occurred_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface">{event.description}</p>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <pre className="mt-3 bg-surface-container-low p-3 rounded-md text-xs text-on-surface-variant overflow-x-auto border border-outline-variant">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant">
                  No activities recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
