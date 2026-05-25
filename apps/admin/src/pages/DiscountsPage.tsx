import { useState, useEffect } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import { Card, Button, Badge, Input } from '@byteevolvr/ui';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';;
import { Plus, Search, Filter, MoreHorizontal, Tag, Loader2, X } from 'lucide-react';

export function DiscountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '0',
    max_uses: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getCoupons();
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

  const handleSaveDiscount = async () => {
    if (!formData.code || !formData.value) return;
    setIsSaving(true);
    try {
      await AdminService.createCoupon({
        code: formData.code,
        discount_type: formData.type,
        discount_value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount),
        usage_limit: formData.max_uses ? Number(formData.max_uses) : null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active
      });
      setShowModal(false);
      setFormData({ code: '', type: 'percentage', value: '', min_order_amount: '0', max_uses: '', start_date: '', end_date: '', is_active: true });
      fetchDiscounts();
    } catch (err: any) {
      console.error('Failed to create discount', err?.response?.data || err);
      alert(`Failed to create discount. ${err?.response?.data?.message || err?.message || 'Please check inputs.'}`);
    } finally {
      setIsSaving(false);
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
        <Button className="gap-2" onClick={() => setShowModal(true)}>
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
        <div className="p-0">
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
        </div>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {filteredDiscounts.length} discounts</div>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface w-full max-w-[600px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Create Discount</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="rounded-full h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <Input
                label="Discount Code"
                placeholder="e.g. SUMMER2024"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Type
                  </label>
                  <select
                    className="w-full h-11 px-3 rounded-lg border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <Input
                  label="Value"
                  type="number"
                  placeholder="e.g. 20"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Amount"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                />
                <Input
                  label="Max Uses"
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-5 w-5 rounded border-outline"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-on-surface">
                  Activate discount immediately
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSaveDiscount} disabled={isSaving || !formData.code || !formData.value}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Discount
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
