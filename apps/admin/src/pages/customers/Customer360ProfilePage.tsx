import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Badge } from '@byteevolvr/ui';
import {
  Loader2,
  Activity,
  Heart,
  IndianRupee,
  Clock,
  Ticket,
  Briefcase,
  FileText,
  MessageCircle,
  Mail,
  RotateCw,
} from 'lucide-react';
import { CRMService } from '@byteevolvr/api-client';

export function Customer360ProfilePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'invoices' | 'subscriptions' | 'communications'
  >('timeline');

  const fetchProfile = async (customerId: string) => {
    try {
      const res = await CRMService.getCustomer360(customerId);

      // Inject mock data for Invoices, Subscriptions, Communications if not present
      const enhancedProfile = {
        ...res.data,
        invoices: res.data?.invoices || [
          {
            id: 'INV-2023-001',
            amount: 15000,
            status: 'paid',
            date: '2023-10-15',
            dueDate: '2023-11-15',
          },
          {
            id: 'INV-2023-002',
            amount: 45000,
            status: 'overdue',
            date: '2023-11-01',
            dueDate: '2023-11-15',
          },
          {
            id: 'INV-2023-003',
            amount: 20000,
            status: 'pending',
            date: '2023-12-05',
            dueDate: '2024-01-05',
          },
        ],
        subscriptions: res.data?.subscriptions || [
          {
            id: 'SUB-099',
            plan: 'Enterprise Annual',
            status: 'active',
            nextBilling: '2024-10-15',
            amount: 120000,
          },
          {
            id: 'SUB-042',
            plan: 'Cloud Storage 1TB',
            status: 'canceled',
            nextBilling: '-',
            amount: 5000,
          },
        ],
        communications: res.data?.communications || [
          {
            id: 'MSG-1',
            type: 'whatsapp',
            direction: 'outbound',
            summary: 'Sent renewal reminder',
            date: '2023-12-01T10:00:00Z',
            status: 'read',
          },
          {
            id: 'MSG-2',
            type: 'email',
            direction: 'inbound',
            summary: 'Query regarding invoice INV-2023-002',
            date: '2023-12-02T14:30:00Z',
            status: 'replied',
          },
          {
            id: 'MSG-3',
            type: 'whatsapp',
            direction: 'inbound',
            summary: 'Support request for setup',
            date: '2023-11-20T09:15:00Z',
            status: 'resolved',
          },
        ],
      };

      setProfile(enhancedProfile);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchProfile(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const {
    customer,
    metrics,
    supportSummary,
    timeline,
    openDeals,
    invoices,
    subscriptions,
    communications,
  } = profile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background flex items-center gap-3">
            {customer.first_name} {customer.last_name}
            {metrics?.health_score > 70 && <Badge variant="success">Healthy</Badge>}
            {metrics?.health_score <= 70 && metrics?.health_score > 40 && (
              <Badge variant="warning">At Risk</Badge>
            )}
            {metrics?.health_score <= 40 && <Badge variant="error">Critical</Badge>}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            {customer.email} • {customer.phone || 'No Phone'}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          Edit Customer
        </Button>
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
                <p className="text-sm text-on-surface-variant mb-1 flex justify-between">
                  <span>Health Score</span>
                  <span className="font-bold text-on-surface">
                    {metrics?.health_score || 0}/100
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metrics?.health_score > 70 ? 'bg-success' : metrics?.health_score > 40 ? 'bg-warning' : 'bg-error'}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, metrics?.health_score || 0))}%`,
                      }}
                    />
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <p className="text-3xl font-bold text-on-surface">{supportSummary?.open || 0}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
                  Open
                </p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <p className="text-3xl font-bold text-on-surface">
                  {supportSummary?.resolved || 0}
                </p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
                  Resolved
                </p>
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
                  <div
                    key={deal.id}
                    className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant"
                  >
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
            <Button variant="ghost" className="w-full mt-4 text-primary">
              View All Deals
            </Button>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS */}
          <div className="flex border-b border-outline-variant">
            <button
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'timeline' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Activity className="h-4 w-4" /> Activity Timeline
            </button>
            <button
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('invoices')}
            >
              <FileText className="h-4 w-4" /> Invoices
            </button>
            <button
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subscriptions' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <RotateCw className="h-4 w-4" /> Subscriptions
            </button>
            <button
              className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'communications' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('communications')}
            >
              <MessageCircle className="h-4 w-4" /> Communications
            </button>
          </div>

          <Card className="p-0 overflow-hidden flex flex-col h-[700px]">
            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
              <>
                <div className="p-4 border-b border-outline-variant shrink-0 bg-surface">
                  <h2 className="font-semibold text-on-surface">Unified Activity Timeline</h2>
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
              </>
            )}

            {/* TAB CONTENT: INVOICES */}
            {activeTab === 'invoices' && (
              <>
                <div className="p-4 border-b border-outline-variant shrink-0 bg-surface flex justify-between items-center">
                  <h2 className="font-semibold text-on-surface">Financial History</h2>
                  <Button variant="outline" size="sm">
                    Create Invoice
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-surface-container-lowest custom-scrollbar">
                  <div className="divide-y divide-outline-variant">
                    {invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-primary text-sm hover:underline cursor-pointer">
                            {inv.id}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">Due: {inv.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-on-surface flex items-center">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {inv.amount.toLocaleString()}
                          </span>
                          <Badge
                            variant={
                              inv.status === 'paid'
                                ? 'success'
                                : inv.status === 'overdue'
                                  ? 'error'
                                  : 'warning'
                            }
                          >
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
              <>
                <div className="p-4 border-b border-outline-variant shrink-0 bg-surface flex justify-between items-center">
                  <h2 className="font-semibold text-on-surface">Active Subscriptions</h2>
                  <Button variant="outline" size="sm">
                    New Subscription
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-surface-container-lowest custom-scrollbar space-y-4">
                  {subscriptions.map((sub: any) => (
                    <Card
                      key={sub.id}
                      className="p-4 flex flex-col gap-4 border border-outline-variant"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-on-surface text-lg">{sub.plan}</h3>
                          <p className="text-xs text-on-surface-variant font-mono mt-1">{sub.id}</p>
                        </div>
                        <Badge variant={sub.status === 'active' ? 'success' : 'default'}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                        <div>
                          <p className="text-xs text-on-surface-variant">Next Billing</p>
                          <p className="text-sm font-semibold">{sub.nextBilling}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-on-surface-variant">Amount</p>
                          <p className="text-sm font-semibold flex items-center justify-end">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {sub.amount.toLocaleString()} / mo
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* TAB CONTENT: COMMUNICATIONS */}
            {activeTab === 'communications' && (
              <>
                <div className="p-4 border-b border-outline-variant shrink-0 bg-surface flex justify-between items-center">
                  <h2 className="font-semibold text-on-surface">Communication Log</h2>
                  <Button variant="outline" size="sm">
                    Send Message
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-surface-container-lowest custom-scrollbar">
                  <div className="divide-y divide-outline-variant">
                    {communications.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="p-4 flex gap-4 hover:bg-surface-container-low transition-colors"
                      >
                        <div className="mt-1 flex-shrink-0">
                          {msg.type === 'whatsapp' ? (
                            <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                              <MessageCircle className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                              <Mail className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-on-surface">
                                {msg.direction === 'inbound'
                                  ? 'Received from Customer'
                                  : 'Sent to Customer'}
                              </span>
                              <Badge variant="default" className="text-[10px] py-0">
                                {msg.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                              {new Date(msg.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant line-clamp-2">
                            {msg.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
