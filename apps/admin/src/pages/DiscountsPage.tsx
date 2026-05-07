import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from '../components/ui';
import { Plus, Search, Filter, MoreHorizontal, Tag } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

export function DiscountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getCoupons();
      if (data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          code: d.code,
          type: d.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
          value: d.discount_type === 'percentage' ? `${d.discount_value}%` : `₹${d.discount_value}`,
          status: d.is_active
            ? d.end_date && new Date(d.end_date) < new Date()
              ? 'expired'
              : 'active'
            : 'inactive',
          usage: `${d.usage_count} / ${d.usage_limit || 'Unlimited'}`,
          expiry: d.end_date ? new Date(d.end_date).toLocaleDateString() : 'No expiry',
        }));
        setDiscounts(mapped);
      } else {
        setDiscounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Discounts</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage coupon codes and automatic promotions
          </p>
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
                  <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                    Loading discounts...
                  </TableCell>
                </TableRow>
              ) : filteredDiscounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                    {searchTerm ? `No discounts matching "${searchTerm}"` : 'No discounts found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDiscounts.map((discount) => (
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
                          discount.status === 'active'
                            ? 'success'
                            : discount.status === 'expired'
                              ? 'error'
                              : 'warning'
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {filteredDiscounts.length} discounts</div>
          {/* Pagination hidden until implemented */}
        </div>
      </Card>
    </div>
  );
}
