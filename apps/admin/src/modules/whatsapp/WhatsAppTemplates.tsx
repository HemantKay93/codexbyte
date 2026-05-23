import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui';
import { apiClient } from '@byteevolvr/api-client';

export function WhatsAppTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', content: '', variables: '' });

  const AVAILABLE_VARIABLES = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'orderId', label: 'Order ID' },
    { key: 'trackingUrl', label: 'Tracking URL' },
    { key: 'amount', label: 'Order Amount' },
    { key: 'status', label: 'Order Status' },
    { key: 'storeName', label: 'Store Name' }
  ];

  const insertVariable = (key: string) => {
    const newContent = editForm.content + ` {{${key}}}`;
    const currentVars = editForm.variables.split(',').map(v => v.trim()).filter(Boolean);
    if (!currentVars.includes(key)) {
      currentVars.push(key);
    }
    
    setEditForm({ 
      ...editForm, 
      content: newContent, 
      variables: currentVars.join(', ') 
    });
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/whatsapp/templates');
      if (res.data) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const saveTemplate = async () => {
    try {
      if (!editForm.name.trim() || !editForm.content.trim()) {
        toast.error('Template name and content are required');
        return;
      }

      const payload = {
        name: editForm.name,
        content: editForm.content,
        variables: editForm.variables.split(',').map(v => v.trim()).filter(Boolean)
      };

      if (editingId === 'new') {
        const res = await apiClient.post('/whatsapp/templates', payload);
        if (res.data) {
          toast.success('Template saved');
          setEditingId(null);
          fetchTemplates();
        }
      } else {
        const res = await apiClient.put(`/whatsapp/templates/${editingId}`, payload);
        if (res.data) {
          toast.success('Template saved');
          setEditingId(null);
          fetchTemplates();
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save template';
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiClient.delete(`/whatsapp/templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch {
      toast.error('Failed to delete template');
    }
  };

  if (loading && templates.length === 0) return <div>Loading templates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Message Templates</h2>
          <p className="text-sm text-on-surface-variant">Manage automated reply structures</p>
        </div>
        <button
          onClick={() => {
            setEditingId('new');
            setEditForm({ name: '', content: '', variables: '' });
          }}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {editingId === 'new' && (
          <div className="bg-surface p-6 rounded-xl border border-primary shadow-sm space-y-4">
             <h3 className="font-semibold text-lg">Create New Template</h3>
             <div>
               <label className="block text-sm font-medium mb-1">Template Name (e.g. ORDER_CREATED)</label>
               <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded-lg" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 flex justify-between items-center">
                 Message Content
                 <span className="text-xs text-on-surface-variant font-normal">Click a variable below to insert</span>
               </label>
               <div className="flex flex-wrap gap-2 mb-2">
                 {AVAILABLE_VARIABLES.map(v => (
                   <button 
                     key={v.key} 
                     onClick={() => insertVariable(v.key)}
                     className="px-2 py-1 bg-surface-container-high hover:bg-primary/20 text-xs rounded border border-outline-variant transition-colors"
                   >
                     + {v.label}
                   </button>
                 ))}
               </div>
               <textarea rows={4} value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Detected Variables (comma separated)</label>
               <input value={editForm.variables} onChange={e => setEditForm({...editForm, variables: e.target.value})} placeholder="orderId, customerName" className="w-full p-2 border rounded-lg bg-surface-container-low" />
             </div>
             <div className="flex justify-end gap-2">
               <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
               <button onClick={saveTemplate} className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center"><Save className="w-4 h-4 mr-2"/> Save</button>
             </div>
          </div>
        )}

        {templates.map(t => (
          editingId === t.id ? (
            <div key={t.id} className="bg-surface p-6 rounded-xl border border-primary shadow-sm space-y-4">
             <h3 className="font-semibold text-lg">Edit Template</h3>
             <div>
               <label className="block text-sm font-medium mb-1">Template Name</label>
               <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded-lg" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 flex justify-between items-center">
                 Message Content
                 <span className="text-xs text-on-surface-variant font-normal">Click a variable below to insert</span>
               </label>
               <div className="flex flex-wrap gap-2 mb-2">
                 {AVAILABLE_VARIABLES.map(v => (
                   <button 
                     key={v.key} 
                     onClick={() => insertVariable(v.key)}
                     className="px-2 py-1 bg-surface-container-high hover:bg-primary/20 text-xs rounded border border-outline-variant transition-colors"
                   >
                     + {v.label}
                   </button>
                 ))}
               </div>
               <textarea rows={4} value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Detected Variables (comma separated)</label>
               <input value={editForm.variables} onChange={e => setEditForm({...editForm, variables: e.target.value})} className="w-full p-2 border rounded-lg bg-surface-container-low" />
             </div>
             <div className="flex justify-end gap-2">
               <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
               <button onClick={saveTemplate} className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center"><Save className="w-4 h-4 mr-2"/> Save</button>
             </div>
            </div>
          ) : (
            <div key={t.id} className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm space-y-3 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => {
                  setEditingId(t.id);
                  setEditForm({ name: t.name, content: t.content, variables: (t.variables || []).join(', ') });
                }} className="p-1.5 text-on-surface-variant hover:text-primary bg-surface-container rounded-md"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-on-surface-variant hover:text-error bg-surface-container rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="font-bold text-on-surface text-lg">{t.name}</h3>
              <div className="bg-surface-container-low p-3 rounded-lg text-sm font-mono text-on-surface-variant whitespace-pre-wrap">
                {t.content}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(t.variables || []).map((v: string) => (
                  <span key={v} className="px-2 py-1 bg-secondary-container text-on-secondary-container text-xs rounded-full font-medium">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
