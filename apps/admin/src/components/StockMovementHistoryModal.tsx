import { useEffect, useState } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import {
  Loader2,
  X,
  Clock,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { Button, Badge } from '@byteevolvr/ui';

export function StockMovementHistoryModal({
  product,
  isOpen,
  onClose,
}: {
  product: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean;
  onClose: () => void;
}) {
  const [movements, setMovements] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen && product) {
      AdminService.getStockMovements(product.id)
        .then((data) => setMovements(data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
      case 'out':
        return <ArrowUpRight className="h-4 w-4 text-rose-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-indigo-500" />;
      case 'adjustment':
        return <Info className="h-4 w-4 text-warning" />;
      case 'return':
        return <ArrowDownRight className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-on-surface-variant" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'in':
        return 'success';
      case 'out':
        return 'error';
      case 'transfer':
        return 'primary';
      case 'adjustment':
        return 'warning';
      case 'return':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-[600px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[80vh]">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 shadow-inner">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Movement History</h3>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                {product.name} (SKU: {product.sku})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 rounded-xl hover:bg-surface-container"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center p-12 text-on-surface-variant italic">
              No stock movements recorded for this item.
            </div>
          ) : (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-outline-variant">
              {movements.map((mov) => (
                <div key={mov.id} className="relative flex items-start gap-6">
                  <div
                    className={`absolute left-0 h-10 w-10 rounded-full border bg-surface-container-lowest flex items-center justify-center z-10`}
                  >
                    {getTypeIcon(mov.type)}
                  </div>
                  <div className="ml-10 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeBadgeVariant(mov.type)} className="capitalize">
                          {mov.type}
                        </Badge>
                        <span
                          className={`text-sm font-black ${mov.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          {mov.quantity > 0 ? '+' : ''}
                          {mov.quantity}
                        </span>
                        <span className="text-sm font-bold text-on-surface-variant">
                          • {mov.warehouse_name}
                        </span>
                      </div>
                      <time className="text-[10px] font-medium text-on-surface-variant uppercase">
                        {new Date(mov.created_at).toLocaleString()}
                      </time>
                    </div>
                    {mov.notes && (
                      <p className="text-sm text-on-surface-variant mt-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                        {mov.notes}
                      </p>
                    )}
                    {mov.user_profiles?.full_name && (
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-2 font-bold">
                        By {mov.user_profiles.full_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
