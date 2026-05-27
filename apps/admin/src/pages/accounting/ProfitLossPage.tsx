import { Card, Button } from '@byteevolvr/ui';
import { Download, Printer } from 'lucide-react';

export function ProfitLossPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Profit & Loss Statement
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Financial performance overview for the current year
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
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-on-surface uppercase tracking-widest">
            ByteEvolvr Technologies
          </h2>
          <h3 className="text-lg font-semibold text-on-surface-variant mt-1">
            Profit & Loss Statement
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            For the period: 1 April 2026 to 31 March 2027
          </p>
        </div>

        <div className="max-w-4xl mx-auto border border-outline-variant">
          <div className="flex bg-primary/5 p-4 font-bold border-b border-primary/20">
            <div className="flex-1">Particulars</div>
            <div className="w-48 text-right">Amount (₹)</div>
          </div>

          <div className="p-4 border-b border-outline-variant">
            <h4 className="font-bold mb-3 text-primary uppercase text-sm">Income</h4>
            <div className="flex justify-between py-1.5 pl-4">
              <span>Sales Revenue</span>
              <span>14,50,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4">
              <span>Other Income</span>
              <span>25,000.00</span>
            </div>
            <div className="flex justify-between py-2 mt-2 font-bold border-t border-outline-variant bg-surface-container pl-4">
              <span>Total Income</span>
              <span>14,75,000.00</span>
            </div>
          </div>

          <div className="p-4 border-b border-outline-variant">
            <h4 className="font-bold mb-3 text-error uppercase text-sm">Expenses</h4>
            <div className="flex justify-between py-1.5 pl-4">
              <span>Cost of Goods Sold (COGS)</span>
              <span>6,50,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4">
              <span>Operating Expenses (Rent, Utilities)</span>
              <span>1,20,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4">
              <span>Salaries & Wages</span>
              <span>3,00,000.00</span>
            </div>
            <div className="flex justify-between py-2 mt-2 font-bold border-t border-outline-variant bg-surface-container pl-4">
              <span>Total Expenses</span>
              <span>10,70,000.00</span>
            </div>
          </div>

          <div className="flex p-4 font-bold border-b-4 border-double border-primary bg-primary/10 text-lg">
            <div className="flex-1 text-primary">Net Profit Before Tax</div>
            <div className="w-48 text-right text-primary">4,05,000.00</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
