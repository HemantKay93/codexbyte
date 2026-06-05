import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Package, TrendingDown, AlertTriangle, ArrowRightLeft, Loader2, Plus } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function InventoryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    pendingTransfers: 0,
    recentMovements: [] as any[],
    criticalLowStock: [] as any[],
    stockByCategory: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getInventoryDashboardMetrics();
      if (res?.data) {
        setMetrics({
          totalItems: res.data.total_items || 0,
          totalValue: res.data.total_value || 0,
          lowStockCount: res.data.low_stock_count || 0,
          pendingTransfers: res.data.pending_transfers || 0,
          recentMovements: res.data.recent_movements || [],
          criticalLowStock: res.data.critical_low_stock || [],
          stockByCategory: res.data.stock_by_category || [
            { name: 'Electronics', value: 4000 },
            { name: 'Apparel', value: 3000 },
            { name: 'Home & Kitchen', value: 2000 },
            { name: 'Sports', value: 1000 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load inventory metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Overview of stock levels, movements, and alerts
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/operations/inventory">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </Link>
          <Link to="/operations/stock-transfers">
            <Button className="gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Transfer Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Package className="h-5 w-5" />
            <span className="font-medium">Total Items in Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">
            {metrics.totalItems.toLocaleString()}
          </h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <TrendingDown className="h-5 w-5" />
            <span className="font-medium">Total Value (Cost)</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{metrics.totalValue.toLocaleString()}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-3 mb-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <h3 className="text-2xl font-bold text-warning">{metrics.lowStockCount} Items</h3>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-warning hover:bg-warning/10 p-0 h-auto"
          >
            View details →
          </Button>
        </Card>
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
            <span className="font-medium">Pending Transfers</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">{metrics.pendingTransfers}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Stock Value by Category
          </div>
          <div className="p-6 flex-1 flex items-center justify-center">
            {metrics.stockByCategory.length === 0 ? (
              <div className="text-on-surface-variant text-sm">No category data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.stockByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.stockByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            'var(--color-primary)',
                            'var(--color-success)',
                            'var(--color-warning)',
                            'var(--color-error)',
                          ][index % 4]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden lg:col-span-2 flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Recent Stock Movements
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.recentMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-on-surface-variant">
                    No recent movements
                  </TableCell>
                </TableRow>
              ) : (
                metrics.recentMovements.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'IN' ? 'text-success bg-success/10' : item.type === 'OUT' ? 'text-error bg-error/10' : 'text-primary bg-primary/10'}`}
                      >
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.type === 'OUT' ? '-' : '+'}
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-on-surface-variant text-sm">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-error">
            Critical Low Stock
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Min Level</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.criticalLowStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-on-surface-variant">
                    No critical low stock
                  </TableCell>
                </TableRow>
              ) : (
                metrics.criticalLowStock.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-right text-error font-bold">
                      {item.current_stock}
                    </TableCell>
                    <TableCell className="text-right text-on-surface-variant">
                      {item.min_level}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
