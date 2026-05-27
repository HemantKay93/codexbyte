import { Card, Button } from '@byteevolvr/ui';
import { IndianRupee, FileText, ArrowUpRight, ArrowDownRight, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccountingDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Accounting & Finance</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage your books, invoices, and GST filing
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Export Report
          </Button>
          <Link to="/admin/accounting/journal">
            <Button className="gap-2">New Journal Entry</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">Total Revenue</h3>
              <div className="bg-primary/10 p-2 rounded text-primary"><IndianRupee className="h-5 w-5" /></div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹14,50,000</div>
          </div>
          <div className="text-success text-sm flex items-center gap-1 mt-4">
            <ArrowUpRight className="h-4 w-4" /> +12% from last month
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-error flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">Total Expenses</h3>
              <div className="bg-error/10 p-2 rounded text-error"><ArrowDownRight className="h-5 w-5" /></div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹4,20,000</div>
          </div>
          <div className="text-error text-sm flex items-center gap-1 mt-4">
            <ArrowUpRight className="h-4 w-4" /> +5% from last month
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">Net Profit</h3>
              <div className="bg-success/10 p-2 rounded text-success"><FileText className="h-5 w-5" /></div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹10,30,000</div>
          </div>
          <div className="text-success text-sm flex items-center gap-1 mt-4">
            <ArrowUpRight className="h-4 w-4" /> +15% from last month
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Recent Journal Entries</h3>
            <Link to="/admin/accounting/journal" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-container-lowest text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr>
                  <td className="px-4 py-3 text-on-surface">24-May-2026</td>
                  <td className="px-4 py-3 text-on-surface">Office Rent</td>
                  <td className="px-4 py-3 font-medium text-error">-₹50,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-on-surface">23-May-2026</td>
                  <td className="px-4 py-3 text-on-surface">Client Payment (Acme)</td>
                  <td className="px-4 py-3 font-medium text-success">+₹2,50,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">GST Summary (May 2026)</h3>
            <Link to="/admin/accounting/gst" className="text-primary text-sm font-medium hover:underline">File GST</Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Output Tax (Sales)</span>
              <span className="font-bold text-on-surface">₹2,61,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Input Tax Credit (Purchases)</span>
              <span className="font-bold text-on-surface text-success">-₹75,600</span>
            </div>
            <div className="h-px bg-outline-variant my-2" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-on-surface">Net GST Payable</span>
              <span className="text-error">₹1,85,400</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
