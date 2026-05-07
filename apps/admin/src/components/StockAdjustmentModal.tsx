import React, { useState } from 'react';
import { Card, CardContent, Button, Input } from './ui';
import { useAdmin } from '../modules/admin/hooks/useAdmin';
import { Package, Warehouse, Info, Loader2 } from 'lucide-react';

interface Props {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentModal({ product, isOpen, onClose, onSuccess }: Props) {
  const { warehouses, adjustStock, isUpdating } = useAdmin();
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<'in' | 'out' | 'adjustment' | 'return'>('adjustment');
  const [notes, setNotes] = useState('');

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
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Adjust Stock</h3>
              <p className="text-xs text-on-surface-variant">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            &times;
          </button>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
              Warehouse
            </label>
            <select
              className="w-full h-12 px-4 rounded-xl border border-outline bg-surface text-on-surface font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                Type
              </label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-outline bg-surface text-on-surface font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="in">Restock (+)</option>
                <option value="out">Reduce (-)</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return (+)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                Quantity
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
              Notes / Reason
            </label>
            <Input
              placeholder="e.g. Monthly audit, damage report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={isUpdating || !warehouseId || quantity === 0}
              className="flex-1 rounded-xl font-bold"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Stock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
