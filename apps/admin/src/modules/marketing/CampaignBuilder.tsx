import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../../components/ui';
import { Send, Clock, Users, LayoutTemplate, Loader2 } from 'lucide-react';
import { apiClient, MarketingService } from '@byteevolvr/api-client';

export function CampaignBuilder() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [segments, setSegments] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [pushTemplates, setPushTemplates] = useState<any[]>([]);
  // Assuming whatsappTemplates can be fetched similarly if added to MarketingService. For now we will just use custom_content for WA if template isn't available.

  const [campaign, setCampaign] = useState({
    name: '',
    type: 'email',
    segment_id: '',
    template_id: '',
    custom_content: '',
    scheduled_at: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [segs, eTpls, pTpls] = await Promise.all([
          MarketingService.getSegments(),
          MarketingService.getEmailTemplates(),
          MarketingService.getPushTemplates(),
        ]);
        setSegments(segs || []);
        setEmailTemplates(eTpls || []);
        setPushTemplates(pTpls || []);
      } catch (err) {
        console.error('Failed to fetch data for campaign builder', err);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  const handleCreate = async (schedule?: boolean) => {
    setLoading(true);
    try {
      const payload = {
        ...campaign,
        scheduled_at: schedule ? campaign.scheduled_at : null,
      };
      await apiClient.post('/marketing/campaigns', payload);
      alert(schedule ? 'Campaign scheduled successfully!' : 'Campaign queued for immediate sending!');
    } catch (err) {
      console.error(err);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const currentTemplates = campaign.type === 'email' ? emailTemplates : campaign.type === 'push' ? pushTemplates : [];

  if (fetching) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-display-sm font-semibold text-on-background">Campaign Builder</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Create and schedule marketing campaigns across Email, WhatsApp, and Push
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Campaign Name"
                placeholder="e.g. Summer Sale Announcement"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              />
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-medium">
                  Campaign Type
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={campaign.type}
                  onChange={(e) => setCampaign({ ...campaign, type: e.target.value, template_id: '' })}
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-medium">
                  Select Template (Optional)
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={campaign.template_id}
                  onChange={(e) => setCampaign({ ...campaign, template_id: e.target.value })}
                >
                  <option value="">-- Use Custom Content --</option>
                  {currentTemplates.map((tpl: any) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>
              </div>

              {!campaign.template_id && (
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1 font-medium">
                    Custom Content (HTML or Text)
                  </label>
                  <textarea
                    className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[200px]"
                    placeholder="Hello {{customer_name}}..."
                    value={campaign.custom_content}
                    onChange={(e) => setCampaign({ ...campaign, custom_content: e.target.value })}
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Supports variables like {'{{customer_name}}'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Targeting & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Audience Segment
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={campaign.segment_id}
                  onChange={(e) => setCampaign({ ...campaign, segment_id: e.target.value })}
                >
                  <option value="">-- Select Segment --</option>
                  {segments.map((seg: any) => (
                    <option key={seg.id} value={seg.id}>{seg.name} (~{seg.estimated_count} users)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Schedule Date/Time
                </label>
                <Input
                  type="datetime-local"
                  value={campaign.scheduled_at}
                  onChange={(e) => setCampaign({ ...campaign, scheduled_at: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full gap-2" onClick={() => handleCreate(false)} disabled={loading || !campaign.segment_id}>
                <Send className="h-4 w-4" />
                Send Now
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => handleCreate(true)} disabled={loading || !campaign.segment_id || !campaign.scheduled_at}>
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
