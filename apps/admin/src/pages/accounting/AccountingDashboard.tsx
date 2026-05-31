import { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@byteevolvr/ui';
import { IndianRupee, FileText, ArrowUpRight, ArrowDownRight, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountingService } from '@byteevolvr/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', revenue: 400000, expenses: 240000 },
  { name: 'Feb', revenue: 300000, expenses: 139000 },
  { name: 'Mar', revenue: 200000, expenses: 980000 },
  { name: 'Apr', revenue: 278000, expenses: 390800 },
  { name: 'May', revenue: 1890000, expenses: 480000 },
  { name: 'Jun', revenue: 2390000, expenses: 380000 },
];

export function AccountingDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    unreconciledCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // We fetch the current month's P&L and maybe bank info
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
        
        const pl = await AccountingService.getProfitLoss(firstDay, lastDay);
        
        setMetrics({
          totalRevenue: pl.data?.total_revenue || 0,
          totalExpenses: pl.data?.total_expense || 0,
          netProfit: pl.data?.net_profit || 0,
          unreconciledCount: 0 // Mock for now
        });
      } catch (error) {
        console.error('Failed to load accounting dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Button variant="outline" className="gap-2" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Metric,Value\n"
              + `Total Revenue,${metrics.totalRevenue}\n`
              + `Total Expenses,${metrics.totalExpenses}\n`
              + `Net Profit,${metrics.netProfit}\n`
              + `Unreconciled Items,${metrics.unreconciledCount}\n`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "accounting_dashboard_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <FileSpreadsheet className="h-4 w-4" /> Export Report
          </Button>
          <Link to="/accounting/journal">
            <Button className="gap-2">New Journal Entry</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">
                Total Revenue
              </h3>
              <div className="bg-primary/10 p-2 rounded text-primary">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹{metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-error flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">
                Total Expenses
              </h3>
              <div className="bg-error/10 p-2 rounded text-error">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹{metrics.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface-variant text-sm uppercase">
                Net Profit
              </h3>
              <div className="bg-success/10 p-2 rounded text-success">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹{metrics.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Financial Health Tracker</h3>
            <Link
              to="/accounting/profit-loss"
              className="text-primary text-sm font-medium hover:underline"
            >
              View Full P&L
            </Link>
          </div>
          <div className="p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="var(--color-error)" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Unreconciled Bank Transactions</h3>
            <Link
              to="/accounting/banking-reconciliation"
              className="text-primary text-sm font-medium hover:underline"
            >
              Start Reconciliation
            </Link>
          </div>
          <div className="p-10 flex justify-center flex-col items-center text-on-surface-variant">
            <span className="text-4xl font-bold mb-2">{metrics.unreconciledCount}</span>
            <span>Items waiting to be matched</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
