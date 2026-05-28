import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Filter, Users, Loader2, Plus, X } from 'lucide-react';
import { MarketingService } from '@byteevolvr/api-client';

export function AudienceSegments() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    filter_rules: { type: 'all' },
  });

  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await MarketingService.getSegments();
      setSegments(data || []);
    } catch (err) {
      console.error('Failed to load segments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await MarketingService.createSegment(newSegment);
      setShowModal(false);
      setNewSegment({ name: '', description: '', filter_rules: { type: 'all' } });
      await loadSegments();
    } catch (err) {
      console.error('Failed to create segment', err);
      alert('Failed to create segment');
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
          <h1 className="text-display-sm font-semibold text-on-background">Audience Segments</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Build dynamic customer groups for targeting
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Filter className="h-4 w-4" />
          Create Segment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-surface rounded-xl border border-outline">
            <Users className="h-12 w-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
            <p className="text-on-surface-variant">No segments created yet.</p>
          </div>
        ) : (
          segments.map((seg) => (
            <Card key={seg.id}>
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {seg.name}
                </div>
              </div>
              <div>
                <p className="text-body-sm text-on-surface-variant h-10 line-clamp-2">
                  {seg.description || 'No description provided.'}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-on-background">
                    Est. Size: {seg.estimated_count}
                  </span>
                  <Button variant="outline" size="sm">
                    Edit Rules
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
              <h2 className="text-xl font-bold text-on-surface">Create Segment</h2>
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
                label="Segment Name"
                placeholder="e.g. Active Shoppers"
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
              />
              <Input
                label="Description"
                placeholder="Users who purchased in last 30 days"
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Filter Logic
                </label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={newSegment.filter_rules.type}
                  onChange={(e) =>
                    setNewSegment({ ...newSegment, filter_rules: { type: e.target.value } })
                  }
                >
                  <option value="all">All Users</option>
                  <option value="high_spenders">High Spenders (Placeholder)</option>
                </select>
                <p className="text-xs text-on-surface-variant mt-1">
                  Rule engine MVP only supports "All Users" dynamically right now.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving || !newSegment.name}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Segment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
