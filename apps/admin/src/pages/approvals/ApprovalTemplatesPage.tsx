import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, Plus, LayoutTemplate, Activity } from 'lucide-react';
import { ApprovalsService } from '@byteevolvr/api-client';

export function ApprovalTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await ApprovalsService.getTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const fakeTemplate = {
      name: `New Flow ${Math.floor(Math.random() * 1000)}`,
      module: 'crm',
      entity_type: 'deal',
      steps: [{ title: 'Manager Review', required_role: 'manager' }],
    };
    try {
      await ApprovalsService.createTemplate(fakeTemplate);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to create template', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Approval Templates</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure multi-step approval workflows across the enterprise.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
              <LayoutTemplate className="h-10 w-10 mb-4 opacity-50" />
              <p>No templates created yet.</p>
            </div>
          ) : (
            templates.map((tpl) => (
              <Card
                key={tpl.id}
                className="p-5 border-l-4 border-l-primary hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-on-surface line-clamp-1">{tpl.name}</h3>
                  <span className="bg-surface-container text-xs font-semibold px-2 py-1 rounded-md border border-outline-variant uppercase">
                    {tpl.module}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-on-surface-variant flex justify-between">
                    <span>Entity:</span>{' '}
                    <span className="font-medium text-on-surface capitalize">
                      {tpl.entity_type}
                    </span>
                  </p>
                  <p className="text-sm text-on-surface-variant flex justify-between">
                    <span>Created:</span>{' '}
                    <span className="font-medium text-on-surface">
                      {new Date(tpl.created_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                    <Activity className="h-3.5 w-3.5" /> Active Flow
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    Edit Flow
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
