import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Loader2, Plus, GripVertical, IndianRupee, X } from 'lucide-react';
import { AdminService, CRMService } from '@byteevolvr/api-client';

export function CRMDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [activePipeline, setActivePipeline] = useState<any>(null);
  const [boardData, setBoardData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newDealForm, setNewDealForm] = useState({ title: '', value: '', stage_id: '', customer_id: '' });

  useEffect(() => {
    fetchPipelines();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await AdminService.getCustomers();
      const custList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCustomers(custList);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const fetchPipelines = async () => {
    try {
      const res = await CRMService.getPipelines();
      const pipes = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (pipes && pipes.length > 0) {
        setPipelines(pipes);
        setActivePipeline(pipes[0]);
        fetchBoardData(pipes[0].id);
      } else {
        setError("No pipelines found. Please initialize the CRM.");
      }
    } catch (error: any) {
      console.error('Failed to load pipelines', error);
      setError(error.customMessage || "Failed to connect to the database. Please make sure migrations are applied.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardData = async (pipelineId: string) => {
    try {
      const res = await CRMService.getBoardData(pipelineId);
      const board = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setBoardData(board);
    } catch (error) {
      console.error('Failed to load board', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (!dealId) return;

    // Optimistic UI Update
    setBoardData(prev => prev.map(stage => {
      // If we found the deal, we return the stage without it (but wait, we need to add it to the target stage)
      // Since map runs for each stage, we should do a 2-pass update or deep clone.
      return stage;
    }));

    // Better optimistic update logic
    setBoardData(prev => {
      const clone = structuredClone(prev);
      let dealToMove = null;
      for (const stage of clone) {
        const idx = stage.deals?.findIndex((d: any) => d.id === dealId);
        if (idx !== -1 && idx !== undefined) {
          dealToMove = stage.deals[idx];
          stage.deals.splice(idx, 1);
          break;
        }
      }
      if (dealToMove) {
        const targetStage = clone.find(s => s.id === stageId);
        if (targetStage) {
          targetStage.deals.push({ ...dealToMove, stage_id: stageId });
        }
      }
      return clone;
    });

    try {
      await CRMService.moveDealStage(dealId, stageId);
    } catch (error) {
      console.error('Failed to move deal', error);
      // Revert if failed
      if (activePipeline) fetchBoardData(activePipeline.id);
    }
  };

  const handleCreateDeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activePipeline || !newDealForm.title || !newDealForm.stage_id) return;
    
    setIsSubmitting(true);
    try {
      await CRMService.createDeal({
        title: newDealForm.title,
        value: Number(newDealForm.value) || 0,
        pipeline_id: activePipeline.id,
        stage_id: newDealForm.stage_id,
        customer_id: newDealForm.customer_id || null
      });
      setShowNewDealModal(false);
      setNewDealForm({ title: '', value: '', stage_id: '', customer_id: '' });
      await fetchBoardData(activePipeline.id);
      alert('Deal successfully created and saved!');
    } catch (error) {
      console.error('Failed to create deal', error);
      alert('Failed to create deal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">CRM Pipelines</h1>
          <div className="flex items-center gap-4 mt-2">
            <select 
              className="h-9 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              value={activePipeline?.id || ''}
              onChange={(e) => {
                const p = pipelines.find(p => p.id === e.target.value);
                setActivePipeline(p);
                if (p) fetchBoardData(p.id);
              }}
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <Button 
          className="gap-2" 
          disabled={!!error || loading || pipelines.length === 0}
          onClick={() => {
            setNewDealForm(prev => ({ ...prev, stage_id: boardData[0]?.id || '' }));
            setShowNewDealModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Deal
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full text-center p-6 bg-surface-container-low rounded-2xl border border-error/20 max-w-2xl mx-auto mt-10">
            <div className="h-12 w-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
              <X className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Failed to Load CRM</h2>
            <p className="text-on-surface-variant mb-6">{error}</p>
            <Button onClick={() => { setError(null); setLoading(true); fetchPipelines(); }}>
              Retry Loading
            </Button>
          </div>
        ) : pipelines.length === 0 ? (
          <div className="flex justify-center items-center h-full text-on-surface-variant">
            No pipelines available.
          </div>
        ) : (
          <div className="flex gap-6 h-full items-start min-w-max">
            {boardData.map(stage => (
              <div 
                key={stage.id} 
                className="w-80 flex flex-col max-h-full bg-surface-container-low rounded-xl border border-outline-variant shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container/50 rounded-t-xl shrink-0">
                  <h3 className="font-bold text-on-surface">{stage.name}</h3>
                  <span className="bg-surface text-on-surface-variant text-xs font-bold px-2 py-1 rounded-full border border-outline-variant">
                    {stage.deals?.length || 0}
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                  {stage.deals?.map((deal: any) => (
                    <Card 
                      key={deal.id} 
                      className="p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm"
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, deal.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-on-surface leading-tight text-sm">{deal.title}</h4>
                        <GripVertical className="h-4 w-4 text-on-surface-variant opacity-50 shrink-0 ml-2" />
                      </div>
                      <div className="text-xs text-on-surface-variant mb-3 line-clamp-1">
                        {deal.customer_email || 'No contact attached'}
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center text-primary font-semibold text-sm">
                          <IndianRupee className="h-3 w-3 mr-0.5" />
                          {Number(deal.value).toLocaleString()}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold" title={deal.assigned_user_email}>
                          {deal.assigned_user_email ? deal.assigned_user_email[0].toUpperCase() : '?'}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!stage.deals || stage.deals.length === 0) && (
                    <div className="h-24 border-2 border-dashed border-outline-variant rounded-lg flex items-center justify-center text-sm text-on-surface-variant/50">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowNewDealModal(false)}
          />
          <div className="relative bg-surface w-full max-w-[500px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Create New Deal</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewDealModal(false)}
                className="rounded-full h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <Input 
                label="Deal Title *"
                placeholder="e.g. Enterprise License - Acme Corp"
                value={newDealForm.title}
                onChange={(e) => setNewDealForm({...newDealForm, title: e.target.value})}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">Link Customer (Optional)</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant cursor-pointer"
                  value={newDealForm.customer_id}
                  onChange={(e) => setNewDealForm({...newDealForm, customer_id: e.target.value})}
                >
                  <option value="">No customer linked</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">Deal Value (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <IndianRupee className="h-4 w-4" />
                  </span>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={newDealForm.value}
                    onChange={(e) => setNewDealForm({...newDealForm, value: e.target.value})}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">Initial Stage *</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant cursor-pointer"
                  value={newDealForm.stage_id}
                  onChange={(e) => setNewDealForm({...newDealForm, stage_id: e.target.value})}
                >
                  <option value="" disabled>Select a stage</option>
                  {boardData.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewDealModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleCreateDeal()} 
                disabled={isSubmitting || !newDealForm.title || !newDealForm.stage_id}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Deal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
