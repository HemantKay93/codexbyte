import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { Plus, Search, Filter, MoreHorizontal, Tag } from 'lucide-react';
import { getDiscounts } from '@byteevolvr/api-client';

const mockDiscounts = [
  { id: '1', code: 'SUMMER25', type: 'Percentage', value: '25%', status: 'active', usage: '142 / Unlimited', expiry: '2026-08-31' },
  { id: '2', code: 'WELCOME10', type: 'Percentage', value: '10%', status: 'active', usage: '840 / Unlimited', expiry: 'No expiry' },
  { id: '3', code: 'FREESHIP', type: 'Fixed Amount', value: '$15.00', status: 'active', usage: '34 / 100', expiry: '2026-06-15' },
  { id: '4', code: 'BLACKFRIDAY', type: 'Percentage', value: '40%', status: 'scheduled', usage: '0 / Unlimited', expiry: '2026-11-30' },
  { id: '5', code: 'WINTERCLEAR', type: 'Percentage', value: '50%', status: 'expired', usage: '532 / Unlimited', expiry: '2026-02-28' },
];

export function DiscountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const data = await getDiscounts();
        if (data && data.length > 0) {
          // Map DB schema to UI schema if needed
          const mapped = data.map((d: any) => ({
            id: d.id,
            code: d.code,
            type: d.type === 'percentage' ? 'Percentage' : 'Fixed Amount',
            value: d.type === 'percentage' ? `${d.value}%` : `$${d.value}`,
            status: d.status,
            usage: `${d.usage_count} / ${d.usage_limit || 'Unlimited'}`,
            expiry: d.valid_until ? new Date(d.valid_until).toLocaleDateString() : 'No expiry'
          }));
          setDiscounts(mapped);
        } else {
          setDiscounts(mockDiscounts);
        }
      } catch (error) {
        console.warn('Failed to fetch discounts, falling back to mock:', error);
        setDiscounts(mockDiscounts);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Discounts</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage coupon codes and automatic promotions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Discount
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search discount codes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">Loading discounts...</TableCell>
                </TableRow>
              ) : discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-semibold text-on-surface">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {discount.code}
                    </div>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">{discount.type}</TableCell>
                  <TableCell className="font-medium text-on-surface">{discount.value}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        discount.status === 'active' ? 'success' :
                        discount.status === 'expired' ? 'error' : 'warning'
                      }
                    >
                      {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">{discount.usage}</TableCell>
                  <TableCell className="text-on-surface-variant">{discount.expiry}</TableCell>
                  <TableCell>
                    <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {discounts.length} discounts</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
