import { Card, Button } from '@byteevolvr/ui';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@byteevolvr/api-client';
import { Download, FileText } from 'lucide-react';

export function ViewInvoiceModal({
  invoiceId,
  onClose,
  currencySymbol,
}: {
  invoiceId: string;
  onClose: () => void;
  currencySymbol: string;
}) {
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const res = await apiClient.get(`/accounting/invoices/${invoiceId}`);
      return res.data?.data || res.data;
    },
  });

  const invoice = invoiceData;
  const lineItems = invoiceData?.line_items || [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-10 flex flex-col items-center justify-center bg-surface">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Loading Invoice Details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-surface shadow-2xl relative">
        <div className="p-6 border-b border-outline bg-surface sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">Invoice #{invoice.invoice_number}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase mt-1 inline-block ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : invoice.status === 'sent'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-primary hover:text-primary/80 border-primary/20 bg-primary/5"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" /> Download / Print
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1" id="invoice-printable-area">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Billed To:</h3>
              <p className="text-on-surface font-medium">{invoice.customer_name}</p>
              {invoice.customer_email && <p className="text-on-surface-variant text-sm">{invoice.customer_email}</p>}
              {invoice.customer_phone && <p className="text-on-surface-variant text-sm">{invoice.customer_phone}</p>}
              {invoice.customer_gst && <p className="text-on-surface-variant text-sm mt-1">GSTIN: {invoice.customer_gst}</p>}
              {invoice.customer_address && <p className="text-on-surface-variant text-sm mt-1 whitespace-pre-wrap">{invoice.customer_address}</p>}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <span className="text-on-surface-variant font-medium">Invoice Date:</span>
                <span className="text-on-surface font-semibold">{new Date(invoice.created_at).toLocaleDateString()}</span>
                <span className="text-on-surface-variant font-medium">Due Date:</span>
                <span className="text-on-surface font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</span>
                <span className="text-on-surface-variant font-medium">Type:</span>
                <span className="text-on-surface font-semibold uppercase">{invoice.type}</span>
                <span className="text-on-surface-variant font-medium">Supply Type:</span>
                <span className="text-on-surface font-semibold capitalize">{invoice.supply_type}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-y border-outline">
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase">Item Description</th>
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase text-center">HSN/SAC</th>
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase text-center">Qty</th>
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase text-right">Rate</th>
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase text-center">GST %</th>
                  <th className="py-3 px-4 font-semibold text-sm text-on-surface-variant uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-outline-variant/50">
                    <td className="py-3 px-4 text-on-surface">{item.description}</td>
                    <td className="py-3 px-4 text-on-surface text-center">{item.hsn_code || '-'}</td>
                    <td className="py-3 px-4 text-on-surface text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-on-surface text-right">
                      {currencySymbol}{Number(item.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-on-surface text-center">{item.tax_rate}%</td>
                    <td className="py-3 px-4 text-on-surface font-medium text-right">
                      {currencySymbol}{(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm text-on-surface-variant px-2">
                <span>Subtotal</span>
                <span className="font-medium text-on-surface">
                  {currencySymbol}{Number(invoice.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant px-2">
                <span>Tax Total</span>
                <span className="font-medium text-on-surface">
                  {currencySymbol}{Number(invoice.tax_total).toFixed(2)}
                </span>
              </div>
              <hr className="border-outline-variant my-2" />
              <div className="flex justify-between items-center text-lg font-bold text-primary px-2 bg-primary/5 py-3 rounded-lg border border-primary/10">
                <span>Grand Total</span>
                <span>
                  {currencySymbol}{Number(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable-area, #invoice-printable-area * {
            visibility: visible;
          }
          #invoice-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Ensure the modal overlay doesn't prevent scrolling */
          .fixed {
            position: absolute !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
          }
          /* Hide scrollbar on modal for clean print */
          .max-h-[90vh] {
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
