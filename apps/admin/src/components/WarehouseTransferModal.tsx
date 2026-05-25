import { useState } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import { Loader2, X, ArrowRightLeft } from 'lucide-react';
import { Button, Input } from '@byteevolvr/ui';

export function WarehouseTransferModal({
  product,
  warehouses,
  isOpen,
  onClose,
  onSuccess,
}: {
  product: any;
  warehouses: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!fromWarehouse || !toWarehouse || !quantity) {
      setError('Please fill out all required fields.');
      return;
    }
    if (fromWarehouse === toWarehouse) {
      setError('Source and destination warehouses must be different.');
      return;
    }
    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await AdminService.transferStock({
        productId: product.id,
        fromWarehouseId: fromWarehouse,
        toWarehouseId: toWarehouse,
        quantity: Number(quantity),
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-[500px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Transfer Stock</h3>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                {product.name} (SKU: {product.sku})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-xl hover:bg-surface-container">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-xl text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 block mb-2">
                From Warehouse
              </label>
              <select
                className="w-full h-12 px-4 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
              >
                <option value="">Select Origin</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 block mb-2">
                To Warehouse
              </label>
              <select
                className="w-full h-12 px-4 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
              >
                <option value="">Select Destination</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 block mb-2">
                Transfer Quantity
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="h-12 rounded-2xl border-outline focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 block mb-2">
                Notes (Optional)
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Replenishment"
                className="h-12 rounded-2xl border-outline focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest">
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading || !fromWarehouse || !toWarehouse || !quantity}
              className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 text-white"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Transfer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
