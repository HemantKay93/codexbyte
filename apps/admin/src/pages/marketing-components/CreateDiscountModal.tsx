import { useState } from 'react';
import { Button, Input } from '@byteevolvr/ui';
import { X, Plus, Loader2 } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

interface CreateDiscountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDiscountModal({ onClose, onSuccess }: CreateDiscountModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '0',
    max_uses: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const handleSaveDiscount = async () => {
    if (!formData.code || !formData.value) return;
    setIsSaving(true);
    try {
      await AdminService.createCoupon({
        code: formData.code,
        discount_type: formData.type,
        discount_value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount),
        usage_limit: formData.max_uses ? Number(formData.max_uses) : null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create discount', err?.response?.data || err);
      alert(
        `Failed to create discount. ${err?.response?.data?.message || err?.message || 'Please check inputs.'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface w-full max-w-[600px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-xl font-bold text-on-surface">Create Discount</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Discount Code"
            placeholder="e.g. SUMMER2024"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Type
              </label>
              <select
                className="w-full h-11 px-3 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <Input
              label="Value"
              type="number"
              placeholder="e.g. 20"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Amount"
              type="number"
              placeholder="e.g. 100"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
            />
            <Input
              label="Max Uses"
              type="number"
              placeholder="e.g. 50"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-5 w-5 rounded border-outline"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-on-surface">
              Activate discount immediately
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveDiscount}
            disabled={isSaving || !formData.code || !formData.value}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Discount
          </Button>
        </div>
      </div>
    </div>
  );
}
