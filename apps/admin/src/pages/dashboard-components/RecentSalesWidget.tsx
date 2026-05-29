import { Card } from '@byteevolvr/ui';

interface RecentSalesWidgetProps {
  recentSales: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function RecentSalesWidget({ recentSales }: RecentSalesWidgetProps) {
  return (
    <Card className="col-span-3">
      <div>
        <div>Recent Sales</div>
      </div>
      <div>
        <div className="space-y-8">
          {!Array.isArray(recentSales) || recentSales.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant italic">
              No recent sales found.
            </div>
          ) : (
            recentSales.slice(0, 10).map((sale: any, i: number) => (
              // eslint-disable-line @typescript-eslint/no-explicit-any
              <div key={i} className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-semibold text-sm">
                  {(sale.user_profiles?.full_name || 'G').charAt(0)}
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none text-on-surface">
                    {sale.user_profiles?.full_name || 'Walk-in Customer'}
                  </p>
                  <p className="text-sm text-on-surface-variant truncate max-w-[150px]">
                    {sale.user_profiles?.email || sale.order_number}
                  </p>
                </div>
                <div className="ml-auto font-medium text-emerald-600">
                  +₹{Number(sale.total_amount).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
