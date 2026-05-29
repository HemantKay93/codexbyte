import { useState } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Plus, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@byteevolvr/api-client';

import { CustomDatePicker } from './CustomDatePicker';
import { ProductAutocomplete } from './ProductAutocomplete';

export function CreateInvoiceModal({
  onClose,
  currencySymbol,
}: {
  onClose: () => void;
  currencySymbol: string;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: 'b2c',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    status: 'draft',
    due_date: new Date().toISOString().split('T')[0], // Default to today
    supply_type: 'intra-state', // intra-state (CGST+SGST) or inter-state (IGST)
  });

  const [lineItems, setLineItems] = useState([
    { description: '', hsn_code: '', quantity: 1, unit_price: 0, tax_rate: 18 },
  ]);

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/accounting/invoices', {
        invoice: formData,
        lineItems,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // eslint-disable-line @typescript-eslint/no-floating-promises
      onClose();
    },
    onError: (err: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      alert(`Error creating invoice: ${err.message}`);
    },
  });

  const handleSave = () => {
    if (!formData.customer_name) return alert('Customer name required');
    if (formData.type === 'b2b' && !formData.customer_gst)
      return alert('GST is required for B2B invoices');

    // Check if line items are filled
    const invalidItem = lineItems.find((item) => !item.description || item.unit_price <= 0);
    if (invalidItem) return alert('All line items must have a description and price > 0');

    createMutation.mutate();
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price * (item.tax_rate / 100),
    0
  );
  const grandTotal = subtotal + taxTotal;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col bg-surface shadow-2xl">
        <div className="p-6 border-b border-outline bg-surface sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-title-lg font-bold text-on-surface">Create GST Invoice</h2>
            <p className="text-sm text-on-surface-variant">
              Fill in the details to generate a new invoice.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Customer & Invoice Details Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Configuration Card */}
            <div className="bg-surface-container/20 border border-outline-variant/30 border-l-4 border-l-primary rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                Invoice Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Invoice Type</label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 bg-surface border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface appearance-none pr-10"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="b2c">B2C (Retail)</option>
                      <option value="b2b">B2B (Business)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Supply Type (GST)</label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 bg-surface border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface appearance-none pr-10"
                      value={formData.supply_type}
                      onChange={(e) => setFormData({ ...formData, supply_type: e.target.value })}
                    >
                      <option value="intra-state">Intra-State (CGST + SGST)</option>
                      <option value="inter-state">Inter-State (IGST)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-on-surface">Status</label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 bg-surface border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface appearance-none pr-10"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>

                <CustomDatePicker
                  label="Due Date *"
                  value={formData.due_date}
                  onChange={(val) => setFormData({ ...formData, due_date: val })}
                />
              </div>
            </div>

            {/* Customer & Billing Card */}
            <div className="bg-surface-container/20 border border-outline-variant/30 border-l-4 border-l-emerald-500 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                Customer & Billing Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Customer Name *"
                    placeholder="e.g. Acme Corp"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <Input
                  label="Customer Email"
                  type="email"
                  placeholder="billing@acme.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />

                {formData.type === 'b2b' ? (
                  <Input
                    label="GSTIN Number *"
                    placeholder="22AAAAA0000A1Z5"
                    value={formData.customer_gst}
                    onChange={(e) => setFormData({ ...formData, customer_gst: e.target.value })}
                  />
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </div>
          </div>

          <hr className="border-outline-variant" />

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-title-md font-bold text-on-surface">Itemized Bill</h3>
                <p className="text-sm text-on-surface-variant">
                  Add products or services to this invoice.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLineItems([
                    ...lineItems,
                    { description: '', hsn_code: '', quantity: 1, unit_price: 0, tax_rate: 18 },
                  ])
                }
                className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </Button>
            </div>

            <div className="bg-surface-container/20 border border-outline rounded-lg p-1 overflow-visible pb-32">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px] table-fixed">
                <thead>
                  <tr className="bg-surface-container/50">
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[38%]">
                      Item Description
                    </th>
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[15%]">
                      HSN/SAC
                    </th>
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[10%]">
                      Qty
                    </th>
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[15%]">
                      Rate ({currencySymbol})
                    </th>
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[10%]">
                      GST %
                    </th>
                    <th className="py-2 px-3 text-xs font-semibold text-on-surface-variant uppercase w-[10%] text-right">
                      Amount
                    </th>
                    <th className="py-2 px-3 w-[2%]"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {lineItems.map((item, idx) => {
                    const lineAmount = item.quantity * item.unit_price;

                    return (
                      <tr
                        key={idx}
                        className="border-b border-outline-variant/50 last:border-0 group"
                      >
                        <td className="p-2 w-[38%]">
                          <ProductAutocomplete
                            value={item.description}
                            onChange={(val) => {
                              const newItems = [...lineItems];
                              newItems[idx].description = val;
                              setLineItems(newItems);
                            }}
                            onSelectProduct={(p) => {
                              const newItems = [...lineItems];
                              newItems[idx].description = p.name;
                              newItems[idx].unit_price = Number(p.price) || 0;
                              newItems[idx].tax_rate = p.tax_rate || 18;
                              if (p.sku) newItems[idx].hsn_code = p.sku;
                              setLineItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-2 w-[15%]">
                          <Input
                            placeholder="HSN"
                            value={item.hsn_code}
                            onChange={(e) => {
                              const newItems = [...lineItems];
                              newItems[idx].hsn_code = e.target.value;
                              setLineItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-2 w-[10%]">
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...lineItems];
                              newItems[idx].quantity = Number(e.target.value) || 0;
                              setLineItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-2 w-[15%]">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.unit_price}
                            onChange={(e) => {
                              const newItems = [...lineItems];
                              newItems[idx].unit_price = Number(e.target.value) || 0;
                              setLineItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-2 w-[10%]">
                          <div className="relative">
                            <select
                              className="w-full px-3 py-2 bg-surface border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface appearance-none pr-8"
                              value={item.tax_rate}
                              onChange={(e) => {
                                const newItems = [...lineItems];
                                newItems[idx].tax_rate = Number(e.target.value);
                                setLineItems(newItems);
                              }}
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                          </div>
                        </td>
                        <td className="p-2 w-[10%] text-right font-medium text-on-surface">
                          {currencySymbol}
                          {lineAmount.toFixed(2)}
                        </td>
                        <td className="p-2 w-[2%] text-center">
                          <button
                            className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                            disabled={lineItems.length === 1}
                            title="Remove row"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-1/3 space-y-3 bg-surface-container/30 p-4 rounded-lg border border-outline">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-medium text-on-surface">
                    {currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {formData.supply_type === 'intra-state' ? (
                  <>
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>CGST (Total)</span>
                      <span className="font-medium text-on-surface">
                        {currencySymbol}
                        {(taxTotal / 2).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>SGST (Total)</span>
                      <span className="font-medium text-on-surface">
                        {currencySymbol}
                        {(taxTotal / 2).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>IGST (Total)</span>
                    <span className="font-medium text-on-surface">
                      {currencySymbol}
                      {taxTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <hr className="border-outline-variant" />
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                  <span>Grand Total</span>
                  <span>
                    {currencySymbol}
                    {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-outline flex justify-end gap-3 bg-surface sticky bottom-0 z-10 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="min-w-[140px]"
          >
            {createMutation.isPending ? 'Saving...' : 'Create Invoice'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
