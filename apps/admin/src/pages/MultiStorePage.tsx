import { Card, Button, Badge } from '@byteevolvr/ui';
import { Plus, Globe, TrendingUp, TrendingDown, Store, MoreHorizontal } from 'lucide-react';

const mockStores = [
  {
    id: '1',
    name: 'ByteEvolvr India',
    domain: 'in.byteevolvr.com',
    region: 'South Asia',
    currency: 'INR',
    status: 'active',
    revenue: '₹12,45,000',
    orders: 842,
    growth: 18.4,
    trending: 'up',
  },
  {
    id: '2',
    name: 'ByteEvolvr US',
    domain: 'us.byteevolvr.com',
    region: 'North America',
    currency: 'USD',
    status: 'active',
    revenue: '$24,560',
    orders: 1240,
    growth: 5.2,
    trending: 'up',
  },
  {
    id: '3',
    name: 'ByteEvolvr EU',
    domain: 'eu.byteevolvr.com',
    region: 'Europe',
    currency: 'EUR',
    status: 'active',
    revenue: '€18,900',
    orders: 934,
    growth: -2.1,
    trending: 'down',
  },
  {
    id: '4',
    name: 'ByteEvolvr SEA',
    domain: 'sea.byteevolvr.com',
    region: 'Southeast Asia',
    currency: 'SGD',
    status: 'setup',
    revenue: 'SGD 0',
    orders: 0,
    growth: 0,
    trending: 'up',
  },
];

export function MultiStorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Multi-Store Management
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Oversee and compare performance across all regional stores
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add New Store
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <div className="p-6">
            <div className="text-primary font-medium text-sm mb-1 flex items-center gap-2">
              <Globe className="h-4 w-4" /> Total Stores
            </div>
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-xs text-primary/70 mt-1">3 active · 1 in setup</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">
              Combined Revenue (30d)
            </div>
            <div className="text-3xl font-bold text-on-surface">$68,200</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">
              Total Orders (30d)
            </div>
            <div className="text-3xl font-bold text-on-surface">3,016</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Avg. Growth Rate</div>
            <div className="text-3xl font-bold text-success flex items-center gap-1">
              +7.2% <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockStores.map((store) => (
          <Card
            key={store.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${store.status === 'setup' ? 'border-dashed opacity-75' : ''}`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-lg leading-tight">
                      {store.name}
                    </h3>
                    <a href="#" className="text-sm text-primary hover:underline">
                      {store.domain}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={store.status === 'active' ? 'success' : 'warning'}>
                    {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                  </Badge>
                  <button className="text-on-surface-variant hover:text-on-surface">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {store.status === 'setup' ? (
                <div className="flex items-center justify-center h-24 text-on-surface-variant text-sm">
                  <Button variant="outline" className="gap-2">
                    Complete Store Setup →
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant">
                  <div>
                    <div className="text-xs text-on-surface-variant mb-1">Revenue (30d)</div>
                    <div className="font-bold text-on-surface text-lg">{store.revenue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant mb-1">Orders (30d)</div>
                    <div className="font-bold text-on-surface text-lg">
                      {store.orders.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant mb-1">MoM Growth</div>
                    <div
                      className={`font-bold text-lg flex items-center gap-1 ${store.trending === 'up' ? 'text-success' : 'text-error'}`}
                    >
                      {store.trending === 'up' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {store.growth > 0 ? '+' : ''}
                      {store.growth}%
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant">
                <div className="text-xs text-on-surface-variant px-2 py-1 bg-surface-container rounded-full">
                  {store.region}
                </div>
                <div className="text-xs text-on-surface-variant px-2 py-1 bg-surface-container rounded-full">
                  {store.currency}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
