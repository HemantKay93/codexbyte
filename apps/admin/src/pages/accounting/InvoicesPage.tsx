import { useState } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Plus, Search, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, CMSService } from '@byteevolvr/api-client';

import { CreateInvoiceModal } from './components/CreateInvoiceModal';

export function InvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: invoicesResponse, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await apiClient.get('/accounting/invoices');
      return res.data;
    },
  });

  const { data: globalSettings } = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const cmsData = await CMSService.getContent('global');
      return cmsData?.find((s: any) => s.section_key === 'contact')?.content || {};
    },
  });

  const currencyRaw = globalSettings?.currency || 'USD ($)';
  const symbolMatch = currencyRaw.match(/\(([^)]+)\)/);
  const currencySymbol = symbolMatch ? symbolMatch[1] : '$';

  const invoices = Array.isArray(invoicesResponse)
    ? invoicesResponse
    : (invoicesResponse as any)?.data || [];

  const filteredInvoices = invoices.filter(
    (inv: any) =>
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface">Invoices</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage B2B and B2C billing with GST compliance
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Invoice
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div>Loading invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-outline">
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">
                    Invoice #
                  </th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">
                    Customer
                  </th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">Type</th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">Status</th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">Date</th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">Total</th>
                  <th className="py-3 px-4 font-medium text-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{inv.invoice_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-on-surface">{inv.customer_name}</div>
                      {inv.type === 'b2b' && inv.customer_gst && (
                        <div className="text-xs font-semibold text-primary/80 mt-0.5">
                          GSTIN: {inv.customer_gst}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${inv.type === 'b2b' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}
                      >
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          inv.status === 'paid'
                            ? 'bg-green-500/10 text-green-500'
                            : inv.status === 'sent'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold">
                      {currencySymbol}
                      {Number(inv.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                      >
                        <FileText className="w-4 h-4 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}
