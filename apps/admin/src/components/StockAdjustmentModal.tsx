import { useState, useEffect } from 'react';
import { Button, Input } from '@byteevolvr/ui';
import { Package, Warehouse, Info, Loader2, X, ChevronDown } from 'lucide-react';

import { useAdmin } from '../modules/admin/hooks/useAdmin';

interface Props {
  product: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentModal({ product, isOpen, onClose, onSuccess }: Props) {
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<'in' | 'out' | 'adjustment' | 'return'>('adjustment');
  const [notes, setNotes] = useState('');
  const { warehouses, adjustStock, isUpdating, fetchWarehouses } = useAdmin();

  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
      // eslint-disable-line @typescript-eslint/no-floating-promises
    }
  }, [isOpen]);
  // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdjust = async () => {
    if (!warehouseId || quantity === 0) return;
    try {
      await adjustStock({
        productId: product.id,
        warehouseId,
        quantity: type === 'out' ? -Math.abs(quantity) : quantity,
        type,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Adjustment failed:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.customMessage ||
        'Adjustment failed. Please check your stock and warehouse selection.';
      alert(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative bg-surface w-full max-w-[500px] min-w-[320px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ width: '500px' }}
      >
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface tracking-tight uppercase">
                Adjust Stock
              </h3>
              <p className="text-xs font-bold text-on-surface-variant truncate max-w-[280px]">
                {product.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-10 w-10 p-0 hover:bg-error/10 hover:text-error transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 flex items-center gap-2">
                <Warehouse className="h-3 w-3" /> Select Warehouse
              </label>
              <div className="relative">
                <select
                  className="w-full h-14 px-4 pr-12 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer hover:border-primary/50 appearance-none"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="">Choose a warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
              </div>
              {warehouses.length === 0 && (
                <p className="text-[10px] text-error font-bold ml-1 uppercase">
                  No active warehouses found
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Operation Type
                </label>
                <div className="relative">
                  <select
                    className="w-full h-14 px-4 pr-12 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer hover:border-primary/50 appearance-none"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    // eslint-disable-line @typescript-eslint/no-explicit-any
                  >
                    <option value="in">Restock (+)</option>
                    <option value="out">Reduce (-)</option>
                    <option value="adjustment">Manual Adjustment</option>
                    <option value="return">Customer Return (+)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="h-14 rounded-2xl text-lg font-black border-outline focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 flex items-center gap-2">
                <Info className="h-3 w-3" /> Adjustment Notes
              </label>
              <Input
                placeholder="Why are you adjusting this stock?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-14 rounded-2xl font-medium border-outline focus:ring-primary"
              />
            </div>

            <div className="pt-6 flex gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-surface-container"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdjust}
                disabled={isUpdating || !warehouseId || quantity === 0}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Update'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
