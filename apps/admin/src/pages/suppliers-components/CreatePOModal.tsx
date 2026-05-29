import { useState } from 'react';
import { Button, Input } from '@byteevolvr/ui';
import { X, Plus, Loader2, Trash } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

interface CreatePOModalProps {
  supplier: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePOModal({ supplier, onClose, onSuccess }: CreatePOModalProps) {
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (items.some((i) => !i.productId || i.quantity <= 0 || i.unitCost < 0)) {
      alert('Please fill out all items with valid product IDs and positive values.');
      return;
    }

    setIsSubmitting(true);
    try {
      await AdminService.createPurchaseOrder({
        supplierId: supplier.id,
        expectedDelivery,
        items,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create PO', error);
      alert('Failed to create Purchase Order. Verify product IDs exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-[600px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-xl font-bold text-on-surface">Create PO for {supplier.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Expected Delivery (Optional)"
            type="date"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
          />

          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-on-surface">PO Items</h3>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-end gap-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl"
              >
                <div className="flex-1">
                  <Input
                    label="Product ID (UUID)"
                    value={item.productId}
                    onChange={(e) => handleChangeItem(index, 'productId', e.target.value)}
                    placeholder="Enter existing product ID"
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Qty"
                    type="number"
                    min="1"
                    value={item.quantity.toString()}
                    onChange={(e) =>
                      handleChangeItem(index, 'quantity', parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="w-32">
                  <Input
                    label="Unit Cost ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitCost.toString()}
                    onChange={(e) =>
                      handleChangeItem(index, 'unitCost', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  className="text-error mb-1 p-2 h-10 w-10"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Purchase Order
          </Button>
        </div>
      </div>
    </div>
  );
}
