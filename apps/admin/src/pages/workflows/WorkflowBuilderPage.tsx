import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Loader2, Plus, Zap, Mail, Play, Save, ChevronRight, Activity, X } from 'lucide-react';
import { WorkflowsService } from '@byteevolvr/api-client';

export function WorkflowBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await WorkflowsService.getWorkflows();
      setWorkflows(res.data);
      if (res.data.length > 0 && !activeWorkflow) {
        setActiveWorkflow(res.data[0]);
      }
    } catch (error) {
      console.error('Failed to load workflows', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeWorkflow) return;
    try {
      await WorkflowsService.updateWorkflow(activeWorkflow.id, activeWorkflow);
      alert('Workflow saved!');
    } catch (error) {
      console.error('Failed to save', error);
    }
  };

  const handleDiscard = () => {
    if (!activeWorkflow) return;
    const original = workflows.find(w => w.id === activeWorkflow.id);
    if (original) {
      setActiveWorkflow(JSON.parse(JSON.stringify(original)));
    }
  };

  const updateNode = (index: number, updates: any) => {
    if (!activeWorkflow) return;
    const newNodes = [...activeWorkflow.nodes];
    newNodes[index] = { ...newNodes[index], ...updates, data: { ...newNodes[index].data, ...updates.data } };
    setActiveWorkflow({ ...activeWorkflow, nodes: newNodes });
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newWorkflowName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await WorkflowsService.createWorkflow({
        name: newWorkflowName,
        trigger_event: 'system.custom_event',
        nodes: [
          { id: 'node-1', type: 'trigger', label: 'Custom Trigger', data: { event: 'system.custom_event' } }
        ],
        edges: []
      });
      fetchWorkflows();
      setActiveWorkflow(res.data);
      setShowNewWorkflowModal(false);
      setNewWorkflowName('');
    } catch (error) {
      console.error('Failed to create workflow', error);
      alert('Failed to create workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addActionNode = () => {
    if (!activeWorkflow) return;
    
    const newNodeId = `node-${activeWorkflow.nodes.length + 1}`;
    const previousNode = activeWorkflow.nodes[activeWorkflow.nodes.length - 1];

    const newNode = {
      id: newNodeId,
      type: 'action',
      label: 'Send Email',
      data: { action_type: 'email' }
    };

    const newEdge = {
      id: `edge-${previousNode.id}-${newNodeId}`,
      source: previousNode.id,
      target: newNodeId
    };

    setActiveWorkflow({
      ...activeWorkflow,
      nodes: [...activeWorkflow.nodes, newNode],
      edges: [...activeWorkflow.edges, newEdge]
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar: Workflows List */}
      <div className="w-80 border-r border-outline-variant pr-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-semibold text-lg text-on-background">Automations</h2>
          <Button size="sm" variant="ghost" className="p-0 h-8 w-8" onClick={() => setShowNewWorkflowModal(true)}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            workflows.map(wf => (
              <div 
                key={wf.id}
                onClick={() => setActiveWorkflow(wf)}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  activeWorkflow?.id === wf.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent hover:bg-surface-container-lowest text-on-surface'
                }`}
              >
                <p className="font-semibold text-sm">{wf.name}</p>
                <div className="flex items-center mt-2 text-xs opacity-70 gap-2">
                  <span className={`w-2 h-2 rounded-full ${wf.is_active ? 'bg-green-500' : 'bg-surface-variant'}`} />
                  {wf.trigger_event}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Builder Canvas */}
      <div className="flex-1 pl-6 flex flex-col bg-surface-container-lowest relative rounded-r-xl overflow-hidden">
        {activeWorkflow ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface shrink-0 z-10">
              <div>
                <input 
                  type="text" 
                  value={activeWorkflow.name}
                  onChange={(e) => setActiveWorkflow({...activeWorkflow, name: e.target.value})}
                  className="font-bold text-xl bg-transparent border-none focus:outline-none focus:ring-0 text-on-background w-full"
                />
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Event Trigger: {activeWorkflow.trigger_event}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm font-medium text-on-surface-variant">Active</span>
                  <button 
                    onClick={() => setActiveWorkflow({...activeWorkflow, is_active: !activeWorkflow.is_active})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${activeWorkflow.is_active ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    <span className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all ${activeWorkflow.is_active ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleDiscard}><Play className="h-4 w-4" /> Discard</Button>
                <Button className="gap-2" onClick={handleSave}><Save className="h-4 w-4" /> Save Workflow</Button>
              </div>
            </div>

            {/* Canvas (Simplified Custom DAG Renderer) */}
            <div className="flex-1 overflow-auto p-12 bg-grid-pattern relative flex flex-col items-center">
              
              {activeWorkflow.nodes.map((node: any, index: number) => {
                const isTrigger = node.type === 'trigger';
                
                return (
                  <div key={node.id} className="flex flex-col items-center">
                    {/* Node Card */}
                    <Card className={`w-80 shadow-sm border ${isTrigger ? 'border-primary/50 ring-2 ring-primary/20' : 'border-outline-variant'} relative group`}>
                      <div className={`p-3 border-b flex items-center gap-2 ${isTrigger ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-surface-container border-outline-variant text-on-surface'}`}>
                        {isTrigger ? <Zap className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                        <span className="font-bold text-sm uppercase tracking-wider">{isTrigger ? 'TRIGGER' : 'ACTION'}</span>
                      </div>
                      <div className="p-5 bg-surface flex flex-col gap-2">
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) => updateNode(index, { label: e.target.value })}
                          className="font-semibold text-lg text-on-background bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none transition-colors px-1 -ml-1"
                        />
                        {isTrigger ? (
                          <select 
                            value={node.data.event}
                            onChange={(e) => updateNode(index, { data: { event: e.target.value } })}
                            className="text-sm font-mono bg-surface-container-lowest p-2 rounded border border-outline-variant outline-none focus:border-primary text-on-surface-variant w-full"
                          >
                            <option value="system.custom_event">Custom Event</option>
                            <option value="crm.deal.created">Deal Created</option>
                            <option value="crm.deal.updated">Deal Updated</option>
                            <option value="customer.created">Customer Created</option>
                          </select>
                        ) : (
                          <select 
                            value={node.data.action_type}
                            onChange={(e) => updateNode(index, { data: { action_type: e.target.value } })}
                            className="text-sm font-mono bg-surface-container-lowest p-2 rounded border border-outline-variant outline-none focus:border-primary text-on-surface-variant w-full"
                          >
                            <option value="email">Send Email</option>
                            <option value="sms">Send SMS</option>
                            <option value="notification">Push Notification</option>
                            <option value="slack_message">Slack Alert</option>
                          </select>
                        )}
                      </div>
                    </Card>

                    {/* Edge Line connecting to next node */}
                    {index < activeWorkflow.nodes.length - 1 && (
                      <div className="flex flex-col items-center h-12 w-full">
                        <div className="w-px h-full bg-outline-variant relative">
                          <ChevronRight className="h-4 w-4 absolute -bottom-1 -left-[7px] text-outline-variant rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Node Button */}
              <div className="mt-12 flex flex-col items-center">
                <div className="w-px h-12 bg-dashed border-l-2 border-outline-variant border-dashed mb-2 relative">
                   <ChevronRight className="h-4 w-4 absolute -bottom-2 -left-[9px] text-outline-variant rotate-90" />
                </div>
                <Button variant="outline" className="rounded-full shadow-sm gap-2 mt-2 border-dashed border-2 hover:border-primary hover:text-primary" onClick={addActionNode}>
                  <Plus className="h-4 w-4" /> Add Action Step
                </Button>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant h-full flex-col">
            <Zap className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a workflow from the sidebar or create a new one.</p>
          </div>
        )}
      </div>

      {showNewWorkflowModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowNewWorkflowModal(false)}
          />
          <div className="relative bg-surface w-full max-w-[400px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">New Automation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewWorkflowModal(false)}
                className="rounded-full h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <Input 
                label="Automation Name *"
                placeholder="e.g. Welcome Email Sequence"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
              />
              
              <div className="pt-2 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewWorkflowModal(false)}
                  type="button"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!newWorkflowName.trim() || isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(var(--tw-colors-outline-variant) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
