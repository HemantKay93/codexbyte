import { useState, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    usage_limit: '',
    end_date: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getCoupons();
      // Adjusting for the standardized API response envelope
      const data = response?.data || response;
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

  const handleCreate = async () => {
    if (!formData.code || !formData.discount_value) return;
    setIsSubmitting(true);
    try {
      await AdminService.createCoupon({
        ...formData,
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount),
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
      });
      setIsModalOpen(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', usage_limit: '', end_date: '', is_active: true });
      fetchDiscounts();
    } catch (err) {
      console.error('Failed to create discount', err);
      alert('Failed to create discount. Please check inputs.');
    } finally {
      setIsSubmitting(false);
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
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
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

      {/* Basic Create Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6 bg-surface">
            <h2 className="text-title-lg font-bold mb-4">Create New Discount</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="SUMMER2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-outline bg-surface px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.discount_type} 
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input type="number" value={formData.discount_value} onChange={(e) => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === 'percentage' ? "20" : "500"} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Order Amount (₹)</label>
                <Input type="number" value={formData.min_order_amount} onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})} placeholder="1000" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
