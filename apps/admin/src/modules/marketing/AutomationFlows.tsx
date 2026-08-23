import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { GitBranch, Play, Settings, Plus, Loader2, X } from 'lucide-react';
import { MarketingService } from '@byteevolvr/api-client';

export function AutomationFlows() {
  const [flows, setFlows] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    trigger_event: 'cart_abandoned',
    is_active: true,
  });

  const loadFlows = async () => {
    setLoading(true);
    try {
      const data = await MarketingService.getAutomations();
      setFlows(data || []);
    } catch (err) {
      console.error('Failed to load flows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFlows();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await MarketingService.createAutomation(newFlow);
      setShowModal(false);
      setNewFlow({ name: '', description: '', trigger_event: 'cart_abandoned', is_active: true });
      await loadFlows();
    } catch (err) {
      console.error('Failed to create automation flow', err);
      alert('Failed to create flow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Automation Flows</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Build automated journeys based on user behavior
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Create Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-surface rounded-xl border border-outline">
            <GitBranch className="h-12 w-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
            <p className="text-on-surface-variant">No automation flows found.</p>
          </div>
        ) : (
          flows.map((flow) => (
            <Card key={flow.id}>
              <div className="pb-3 border-b border-outline/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div className="text-title-md">{flow.name}</div>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${flow.is_active ? 'bg-success/10 text-success' : 'bg-surface text-on-surface-variant'}`}
                  >
                    {flow.is_active ? 'Active' : 'Draft'}
                  </div>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <p className="text-body-sm text-on-surface-variant line-clamp-2 h-10">
                  {flow.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-on-surface-variant">Trigger:</span>
                  <span className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-outline">
                    {flow.trigger_event}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="w-full gap-2 text-sm h-9">
                    <Settings className="h-4 w-4" /> Configure
                  </Button>
                  <Button variant="outline" className="w-9 h-9 p-0 flex-shrink-0">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface w-full max-w-[500px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Create Automation Flow</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="rounded-full h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Flow Name"
                placeholder="e.g. Abandoned Cart Recovery"
                value={newFlow.name}
                onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
              />
              <Input
                label="Description"
                placeholder="Send a reminder 2 hours after cart abandoned"
                value={newFlow.description}
                onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Trigger Event
                </label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={newFlow.trigger_event}
                  onChange={(e) => setNewFlow({ ...newFlow, trigger_event: e.target.value })}
                >
                  <option value="cart_abandoned">Cart Abandoned</option>
                  <option value="order_completed">Order Completed</option>
                  <option value="user_signup">User Signup</option>
                  <option value="payment_failed">Payment Failed</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving || !newFlow.name}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Flow
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
