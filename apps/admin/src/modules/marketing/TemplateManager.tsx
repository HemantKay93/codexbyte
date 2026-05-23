import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input } from '../../components/ui';
import { LayoutTemplate, Plus, Loader2, X } from 'lucide-react';
import { MarketingService } from '@byteevolvr/api-client';

export function TemplateManager() {
  const [activeTab, setActiveTab] = useState<'email' | 'push' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [pushTemplates, setPushTemplates] = useState<any[]>([]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    title: '',
    body: '',
    html_content: '',
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [eTpls, pTpls] = await Promise.all([
        MarketingService.getEmailTemplates(),
        MarketingService.getPushTemplates()
      ]);
      setEmailTemplates(eTpls || []);
      setPushTemplates(pTpls || []);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      if (activeTab === 'email') {
        await MarketingService.createEmailTemplate({
          name: newTemplate.name,
          subject: newTemplate.subject,
          html_content: newTemplate.html_content,
        });
      } else if (activeTab === 'push') {
        await MarketingService.createPushTemplate({
          name: newTemplate.name,
          title: newTemplate.title,
          body: newTemplate.body,
        });
      }
      setShowModal(false);
      setNewTemplate({ name: '', subject: '', title: '', body: '', html_content: '' });
      await loadTemplates();
    } catch (err) {
      console.error('Failed to create template', err);
      alert('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const currentList = activeTab === 'email' ? emailTemplates : pushTemplates;

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
          <h1 className="text-display-sm font-semibold text-on-background">Template Manager</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Design and manage reusable campaign templates
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex gap-4 border-b border-outline">
        <button
          className={`pb-2 px-1 text-label-md font-medium border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('email')}
        >
          Email Templates
        </button>
        <button
          className={`pb-2 px-1 text-label-md font-medium border-b-2 transition-colors ${
            activeTab === 'push'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('push')}
        >
          Push Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {currentList.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-surface rounded-xl border border-outline">
            <LayoutTemplate className="h-12 w-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
            <p className="text-on-surface-variant">No templates found for this type.</p>
          </div>
        ) : (
          currentList.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="p-4">
                <div className="aspect-video bg-background border border-outline rounded-lg mb-4 flex items-center justify-center relative group">
                  <LayoutTemplate className="h-8 w-8 text-on-surface-variant opacity-20" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button variant="outline" className="bg-surface text-on-surface border-none">
                      Edit
                    </Button>
                  </div>
                </div>
                <h3 className="text-title-md font-medium mb-1">{tpl.name}</h3>
                <p className="text-body-sm text-on-surface-variant truncate">
                  {activeTab === 'email' ? `Subject: ${tpl.subject}` : `Title: ${tpl.title}`}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface w-full max-w-[600px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">
                Create {activeTab === 'email' ? 'Email' : 'Push'} Template
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="rounded-full h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <Input
                label="Template Name"
                placeholder="e.g. Welcome Email"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />

              {activeTab === 'email' && (
                <>
                  <Input
                    label="Email Subject"
                    placeholder="Welcome to ByteEvolvr!"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      HTML Content
                    </label>
                    <textarea
                      className="w-full h-40 px-3 py-2 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-sm"
                      placeholder="<h1>Hello {{customer_name}}</h1>..."
                      value={newTemplate.html_content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, html_content: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === 'push' && (
                <>
                  <Input
                    label="Push Title"
                    placeholder="Flash Sale!"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      Push Body
                    </label>
                    <textarea
                      className="w-full h-24 px-3 py-2 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      placeholder="Check out our new items..."
                      value={newTemplate.body}
                      onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving || !newTemplate.name}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
