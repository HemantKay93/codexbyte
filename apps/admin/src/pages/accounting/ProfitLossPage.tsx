import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Download, Printer, Loader2 } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function ProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchPL = async () => {
      try {
        setLoading(true);
        // Defaults to current month internally or whatever backend gives if no params
        const res = await AccountingService.getProfitLoss();
        setData(res.data);
      } catch (error) {
        console.error('Failed to load P&L', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPL();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Profit & Loss Statement
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Financial performance overview for the current period
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="p-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-on-surface-variant">No data available</div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-on-surface uppercase tracking-widest">
                ByteEvolvr Technologies
              </h2>
              <h3 className="text-lg font-semibold text-on-surface-variant mt-1">
                Profit & Loss Statement
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                For the current period
              </p>
            </div>

            <div className="max-w-4xl mx-auto border border-outline-variant">
              <div className="flex bg-primary/5 p-4 font-bold border-b border-primary/20">
                <div className="flex-1 text-on-surface">Revenue</div>
                <div className="w-48 text-right text-success">
                  ₹{Number(data.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex bg-error/5 p-4 font-bold border-b border-error/20">
                <div className="flex-1 text-on-surface">Expenses</div>
                <div className="w-48 text-right text-error">
                  ₹{Number(data.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex bg-surface-container-low p-4 font-bold text-lg border-t-2 border-outline">
                <div className="flex-1 text-on-surface uppercase tracking-wider">Net Profit</div>
                <div className={`w-48 text-right ${(data.net_profit || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                  ₹{Number(data.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
