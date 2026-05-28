import { Card } from '@byteevolvr/ui';
import { CheckCircle2, Package, Truck } from 'lucide-react';

export function OrderStatusStepper({ status }: { status: string }) {
  return (
    <Card className="border-none shadow-sm mb-6 bg-surface-container-lowest">
      <div className="p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-outline-variant -z-10 rounded-full" />

          {/* Step 1: Confirmed */}
          <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-4">
            <div
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${['confirmed', 'packed', 'shipped', 'delivered'].includes(status) ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Confirmed</span>
          </div>

          {/* Step 2: Packed */}
          <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-4">
            <div
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${['packed', 'shipped', 'delivered'].includes(status) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
            >
              <Package className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Packed</span>
          </div>

          {/* Step 3: Shipped */}
          <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-4">
            <div
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${['shipped', 'delivered'].includes(status) ? 'border-info bg-info text-white' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
            >
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Shipped</span>
          </div>

          {/* Step 4: Delivered */}
          <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-4">
            <div
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${['delivered'].includes(status) ? 'border-success bg-success text-white' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Delivered</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
