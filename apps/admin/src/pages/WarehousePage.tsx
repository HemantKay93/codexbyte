import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Input } from '../components/ui';
import {
  ScanBarcode,
  PackageCheck,
  Printer,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCcw,
  Building2,
  MapPin,
  Plus,
  Edit2,
  Settings2,
  Package,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

export function WarehousePage() {
  const [activeTab, setActiveTab] = useState<'management' | 'operations'>('management');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [pickTasks, setPickTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'management') {
        const data = await AdminService.getWarehouses();
        setWarehouses(data || []);
      } else {
        const data = await AdminService.getWarehouseTasks();
        setPickTasks(data || []);
      }
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveWarehouse = async () => {
    try {
      if (editingWarehouse) {
        await AdminService.updateWarehouse(editingWarehouse.id, formData);
      } else {
        await AdminService.createWarehouse(formData);
      }
      setShowModal(false);
      setEditingWarehouse(null);
      fetchData();
    } catch (err) {
      console.error('Error saving warehouse:', err);
    }
  };

  const markAsPicked = (id: string) => {
    setPickTasks((prev) => prev.map((task) => (task.id === id ? { ...task, picked: true } : task)));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface uppercase italic">
            Warehouse Console
          </h1>
          <div className="flex gap-1 mt-4 p-1 bg-surface-container rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'management' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Management
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'operations' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Operations
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 w-12 p-0 rounded-2xl"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {activeTab === 'management' ? (
            <Button
              className="h-12 px-6 rounded-2xl gap-2 font-bold"
              onClick={() => {
                setEditingWarehouse(null);
                setFormData({ name: '', location: '', address: '', is_active: true });
                setShowModal(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Warehouse
            </Button>
          ) : (
            <Button className="h-12 px-6 rounded-2xl gap-2 font-bold bg-primary text-on-primary">
              <ScanBarcode className="h-4 w-4" /> Scan Item
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'management' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-3xl bg-surface-container animate-pulse"
                  ></div>
                ))
            : warehouses.map((w) => (
                <Card
                  key={w.id}
                  className="border-none shadow-sm group hover:shadow-md transition-all overflow-hidden bg-surface-container-low"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <Badge variant={w.is_active ? 'success' : 'default'}>
                        {w.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-1">{w.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                      <MapPin className="h-3 w-3" />
                      {w.location}
                    </div>
                    <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        {w.address || 'No address details'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingWarehouse(w);
                          setFormData({
                            name: w.name,
                            location: w.location,
                            address: w.address || '',
                            is_active: w.is_active,
                          });
                          setShowModal(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-warning-container text-on-warning-container p-6 rounded-3xl border border-warning/20 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-warning" />
            <div>
              <h4 className="font-bold">Pending Picking Tasks</h4>
              <p className="text-sm mt-1 opacity-90">
                There are {pickTasks.filter((t) => !t.picked).length} items waiting to be picked
                across the system.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                Retrieving manifest...
              </div>
            ) : pickTasks.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant">
                <PackageCheck className="h-16 w-16 mx-auto mb-4 opacity-10" />
                <p className="text-lg font-medium">All tasks completed. Warehouse is clear!</p>
              </div>
            ) : (
              pickTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`border-none shadow-sm transition-all ${task.picked ? 'opacity-50 grayscale bg-surface-container' : 'hover:shadow-md'}`}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div
                        className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${task.picked ? 'bg-success/10 text-success' : 'bg-surface-container border border-outline-variant text-on-surface'}`}
                      >
                        {task.picked ? (
                          <CheckCircle2 className="h-8 w-8" />
                        ) : (
                          <span className="font-black text-2xl">{task.quantity}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`text-lg font-bold ${task.picked ? 'line-through decoration-2' : 'text-on-surface'}`}
                          >
                            {task.product_name}
                          </span>
                          <Badge
                            variant="info"
                            className="font-mono text-[10px] tracking-tighter uppercase"
                          >
                            {task.order?.order_number}
                          </Badge>
                        </div>
                        <div className="text-xs text-on-surface-variant flex gap-6 font-medium uppercase tracking-widest">
                          <span>
                            SKU: <span className="font-bold text-on-surface">{task.sku}</span>
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            <MapPin className="h-3 w-3" />{' '}
                            {task.product?.warehouse_location || 'ZONE-A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {!task.picked && (
                        <Button
                          size="sm"
                          className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                          onClick={() => markAsPicked(task.id)}
                        >
                          Mark Picked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-black text-on-surface tracking-tight mb-2">
                {editingWarehouse ? 'Update Warehouse' : 'New Warehouse'}
              </h3>
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                Configure essential parameters for your distribution center.
              </p>

              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    Entity Name
                  </label>
                  <Input
                    placeholder="e.g. Mumbai North Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 px-6 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    Location Region
                  </label>
                  <Input
                    placeholder="e.g. Maharashtra"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-14 px-6 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    Full Address
                  </label>
                  <Input
                    placeholder="Detailed logistics address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-14 px-6 rounded-2xl font-bold"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border-outline accent-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-on-surface">
                    Mark as Active & Operational
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveWarehouse}
                  disabled={!formData.name || !formData.location}
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  {editingWarehouse ? 'Update Hub' : 'Initialize Hub'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
