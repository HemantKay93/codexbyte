import { Card } from '@byteevolvr/ui';
import { Package } from 'lucide-react';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../components/ui/Table';

export function OrderItemsTable({ items }: { items: any[] }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h2 className="text-lg font-bold text-on-surface">Order Items ({items.length})</h2>
        <Package className="h-5 w-5 text-on-surface-variant" />
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-lowest">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                Product
              </TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                Price
              </TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                Qty
              </TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => (
              // eslint-disable-line @typescript-eslint/no-explicit-any
              <TableRow
                key={item.id}
                className="hover:bg-surface-container-lowest transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant">
                      <Package className="h-6 w-6 text-on-surface-variant opacity-30" />
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{item.product_name}</div>
                      <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                        SKU: {item.sku}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{Number(item.unit_price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <span className="bg-surface-container px-2 py-1 rounded text-xs font-bold">
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right font-black text-primary">
                  ₹{Number(item.total_price).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
