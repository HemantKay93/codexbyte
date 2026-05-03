import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge } from '../components/ui';
import { ScanBarcode, PackageCheck, Printer, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function WarehousePage() {
  const [pickTasks, setPickTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPickTasks();
  }, []);

  async function fetchPickTasks() {
    setLoading(true);
    try {
      // Fetch order items for orders that are 'processing' or 'confirmed'
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:order_id (
            order_number,
            status
          ),
          product:product_id (
            warehouse_location
          )
        `)
        .in('order.status', ['processing', 'confirmed'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter out items where the order join failed or status is different
      const validTasks = data?.filter(item => item.order) || [];
      setPickTasks(validTasks);
    } catch (err) {
      console.error('Error fetching pick tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  const markAsPicked = (id: string) => {
    // Local state update for simulation (since there's no 'picked' column in order_items yet)
    // In a real app, you'd have a warehouse_task table or similar
    setPickTasks(prev => prev.map(task => 
      task.id === id ? { ...task, picked: true } : task
    ));
  };

  const stats = {
    total: pickTasks.length,
    picked: pickTasks.filter(t => t.picked).length,
    remaining: pickTasks.filter(t => !t.picked).length
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Warehouse Operations</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Active picking lists and fulfillment tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPickTasks} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2 bg-primary text-on-primary">
            <ScanBarcode className="h-4 w-4" /> Scan Item
          </Button>
        </div>
      </div>

      <div className="bg-warning-container text-on-warning-container p-4 rounded-xl border border-warning/20 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Batch Processing</h4>
          <p className="text-sm mt-1 opacity-90">You have {stats.remaining} items remaining to pick across {new Set(pickTasks.map(t => t.order_id)).size} orders.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-on-surface">Pick List</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> Print List
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            Loading warehouse tasks...
          </div>
        ) : pickTasks.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant">
            <PackageCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
            No active picking tasks. All orders are fulfilled!
          </div>
        ) : (
          pickTasks.map((task) => (
            <Card key={task.id} className={`transition-all ${task.picked ? 'opacity-60 bg-surface-container' : 'border-l-4 border-l-primary'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded flex items-center justify-center shrink-0 ${task.picked ? 'bg-success/20 text-success' : 'bg-surface-container border border-outline'}`}>
                    {task.picked ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold text-lg">{task.quantity}x</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${task.picked ? 'line-through decoration-outline-variant text-on-surface-variant' : 'text-on-surface'}`}>{task.product_name}</span>
                      <Badge variant="default" className="text-[10px] py-0">{task.order?.order_number}</Badge>
                    </div>
                    <div className="text-sm text-on-surface-variant flex gap-4">
                      <span>SKU: <span className="font-mono">{task.sku}</span></span>
                      <span className="font-medium text-primary">Loc: {task.product?.warehouse_location || 'Not Assigned'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {task.picked ? (
                    <Badge variant="success">Picked</Badge>
                  ) : (
                    <Button size="sm" onClick={() => markAsPicked(task.id)}>Mark Picked</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button disabled={stats.remaining > 0 || stats.total === 0} onClick={() => alert('Batch fulfillment complete!')}>
          Complete Batch Fulfillment
        </Button>
      </div>
    </div>
  );
}

import { RefreshCcw } from 'lucide-react';
