import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Download, Printer, Loader2 } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function BalanceSheetPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchBS = async () => {
      try {
        setLoading(true);
        const res = await AccountingService.getBalanceSheet();
        setData(res.data);
      } catch (error) {
        console.error('Failed to load Balance Sheet', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBS();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Balance Sheet</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Financial position as of today
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2">
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
              <h3 className="text-lg font-semibold text-on-surface-variant mt-1">Balance Sheet</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                As of {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="border border-outline-variant rounded-lg overflow-hidden">
                <div className="bg-surface-container p-4 font-bold border-b border-outline-variant">
                  Assets
                </div>
                <div className="p-4 flex justify-between font-bold text-success border-t border-outline-variant bg-success/5 mt-auto">
                  <span>Total Assets</span>
                  <span>
                    ₹
                    {Number(data.assets || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="border border-outline-variant rounded-lg overflow-hidden flex flex-col">
                <div className="bg-surface-container p-4 font-bold border-b border-outline-variant">
                  Liabilities & Equity
                </div>
                <div className="p-4 space-y-4 flex-1">
                  <div className="flex justify-between">
                    <span>Liabilities</span>
                    <span>
                      ₹
                      {Number(data.liabilities || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equity</span>
                    <span>
                      ₹
                      {Number(data.equity || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex justify-between font-bold text-error border-t border-outline-variant bg-error/5">
                  <span>Total Liabilities & Equity</span>
                  <span>
                    ₹
                    {(Number(data.liabilities || 0) + Number(data.equity || 0)).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
