import { Card, Button, Input } from '@byteevolvr/ui';
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Truck,
  Search,
} from 'lucide-react';
import { useState } from 'react';

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = async (type: string, format: string) => {
    // Mock export flow
    alert(`Exporting ${type} report in ${format} format...`);
  };

  const reportCategories = [
    {
      category: 'Sales & Orders',
      icon: ShoppingCart,
      reports: [
        { title: 'Daily Sales', desc: 'Day-wise revenue, order count, and returns.' },
        {
          title: 'Monthly Sales summary',
          desc: 'Monthly GMV, AOV, top categories, and repeat rate.',
        },
        {
          title: 'Sales Forecasting',
          desc: 'Predicted revenue based on pipeline and historical data.',
        },
      ],
    },
    {
      category: 'Customers & CRM',
      icon: Users,
      reports: [
        { title: 'Audience Growth', desc: 'New subscribers and segment expansions over time.' },
        { title: 'Lead Conversion', desc: 'Lead-to-opportunity-to-won conversion ratios.' },
        { title: 'Churn Risk', desc: 'Customers with low activity or predictive churn flags.' },
      ],
    },
    {
      category: 'Logistics & Inventory',
      icon: Truck,
      reports: [
        {
          title: 'Shipment SLA',
          desc: 'Export AWB, courier, tracking status, and SLA exceptions.',
        },
        { title: 'Stock Valuation', desc: 'Current inventory cost basis by warehouse.' },
        { title: 'Low Stock Alerts', desc: 'Products nearing reorder points.' },
      ],
    },
    {
      category: 'Financials',
      icon: TrendingUp,
      reports: [
        { title: 'P&L Summary', desc: 'Profit and loss overview across profit centers.' },
        { title: 'Tax & Compliance', desc: 'GST/VAT collected vs paid out.' },
        { title: 'Expense Breakdown', desc: 'Categorized operational expenditures.' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Reporting Hub</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Centralized insights, analytics, and exports across all modules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Custom Report
          </Button>
        </div>
      </div>

      <Card className="p-4 flex items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
          <Input
            placeholder="Search for a report..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {reportCategories.map((group, idx) => {
          const GroupIcon = group.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
                <GroupIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-on-surface">{group.category}</h2>
              </div>
              <div className="space-y-3">
                {group.reports.map((report, rIdx) => (
                  <Card
                    key={rIdx}
                    className="p-4 hover:border-primary transition-colors flex flex-col justify-between h-full"
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-on-surface flex items-center gap-2">
                        <FileText className="h-4 w-4 text-on-surface-variant" />
                        {report.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-1 ml-6">{report.desc}</p>
                    </div>
                    <div className="flex gap-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleExport(report.title, 'CSV')}
                      >
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs gap-1"
                        onClick={() => handleExport(report.title, 'Excel')}
                      >
                        <Download className="h-3 w-3" />
                        Excel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
