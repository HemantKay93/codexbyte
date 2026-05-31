import { Card, Button } from '@byteevolvr/ui';
import { useQuery } from '@tanstack/react-query';
import { apiClient, CMSService } from '@byteevolvr/api-client';
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

  const { data: cmsData } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => CMSService.getContent('global'),
  });

  const invoice = invoiceData;
  const lineItems = invoiceData?.line_items || [];

  const contactSettings = cmsData?.find((s: any) => s.section_key === 'contact')?.content || {};
  const templateSettings = cmsData?.find((s: any) => s.section_key === 'invoice_template')?.content || {};

  const layout = templateSettings.layout || 'classic';
  const primaryColor = templateSettings.primaryColor || '#004ac6';
  const showLogo = templateSettings.showLogo ?? true;
  const showSignatory = templateSettings.showSignatory ?? true;

  const isMinimalist = layout === 'minimalist';
  const isModern = layout === 'modern';

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
              onClick={() => {
                const printContents = document.getElementById('invoice-printable-area')?.outerHTML;
                if (!printContents) return;
                
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const pri = iframe.contentWindow;
                if (pri) {
                  pri.document.open();
                  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                    .map((s) => s.outerHTML)
                    .join('\n');
                    
                  pri.document.write(`
                    <html>
                      <head>
                        <title>Print Invoice</title>
                        ${styles}
                        <style>
                          body { background: white !important; color: black !important; padding: 40px; }
                          * { color: black !important; }
                        </style>
                      </head>
                      <body class="bg-white">
                        ${printContents}
                      </body>
                    </html>
                  `);
                  pri.document.close();
                  pri.focus();
                  setTimeout(() => {
                    pri.print();
                    document.body.removeChild(iframe);
                  }, 250);
                }
              }}
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

        <div className="flex-1 bg-surface-container-lowest border border-outline-variant p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white border border-outline shadow-sm p-10 min-h-[800px] text-black" id="invoice-printable-area">
            {/* Template Header */}
            <div
              className={`flex justify-between items-start mb-6 ${isMinimalist ? 'pb-4 border-b border-gray-200' : isModern ? 'p-6 rounded-xl' : 'pb-6 border-b-2'}`}
              style={{
                borderColor: isMinimalist ? undefined : primaryColor,
                backgroundColor: isModern ? `${primaryColor}10` : 'transparent',
              }}
            >
              <div>
                <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                  {showLogo && <span className="mr-2">■</span>}
                  {contactSettings.storeName || 'ByteEvolvr'}
                </div>
                <div className="text-xs text-gray-600">
                  {contactSettings.email || 'hello@byteevolvr.com'}
                  <br />
                  {(contactSettings.address || '101, Tech Park\nMumbai, Maharashtra 400069')
                    .split('\n')
                    .map((line: string, i: number) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  {contactSettings.gstNumber && `GSTIN: ${contactSettings.gstNumber}`}
                </div>
              </div>
              <div className="text-right">
                <h2
                  className="text-xl font-bold mb-2 uppercase tracking-widest"
                  style={{ color: primaryColor }}
                >
                  Tax Invoice
                </h2>
                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                  <span>Invoice No:</span>{' '}
                  <span className="font-semibold text-black">{invoice.invoice_number}</span>
                  <span>Date:</span> <span className="font-semibold text-black">{new Date(invoice.created_at).toLocaleDateString()}</span>
                  {invoice.due_date && (
                    <>
                      <span>Due Date:</span> <span className="font-semibold text-black">{new Date(invoice.due_date).toLocaleDateString()}</span>
                    </>
                  )}
                  <span>Place of Supply:</span>{' '}
                  <span className="font-semibold text-black capitalize">{invoice.supply_type}</span>
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-1">
                  Billed To
                </h4>
                <div className="text-sm">
                  <p className="font-bold text-black">{invoice.customer_name}</p>
                  {invoice.customer_address && (
                    <p className="text-gray-600 whitespace-pre-wrap">{invoice.customer_address}</p>
                  )}
                  {invoice.customer_phone && <p className="text-gray-600">{invoice.customer_phone}</p>}
                  {invoice.customer_email && <p className="text-gray-600">{invoice.customer_email}</p>}
                  {invoice.customer_gst && <p className="text-gray-600 mt-1">GSTIN: {invoice.customer_gst}</p>}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-sm mb-8 border-collapse">
              <thead>
                <tr
                  style={{
                    backgroundColor: isModern
                      ? `${primaryColor}20`
                      : isMinimalist
                        ? 'transparent'
                        : `${primaryColor}10`,
                    borderTop: isMinimalist ? '1px solid #e5e7eb' : 'none',
                    borderBottom: isMinimalist
                      ? '1px solid #e5e7eb'
                      : `1px solid ${primaryColor}40`,
                  }}
                >
                  <th className="text-left py-2 px-2 font-semibold text-black">Description</th>
                  <th className="text-center py-2 px-2 font-semibold text-black">HSN/SAC</th>
                  <th className="text-right py-2 px-2 font-semibold text-black">Qty</th>
                  <th className="text-right py-2 px-2 font-semibold text-black">Rate</th>
                  <th className="text-right py-2 px-2 font-semibold text-black">GST</th>
                  <th className="text-right py-2 px-2 font-semibold text-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 text-gray-700">
                    <td className="py-3 px-2">{item.description}</td>
                    <td className="text-center py-3 px-2">{item.hsn_code || '-'}</td>
                    <td className="text-right py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">{currencySymbol}{Number(item.unit_price).toFixed(2)}</td>
                    <td className="text-right py-3 px-2">{item.tax_rate}%</td>
                    <td className="text-right py-3 px-2">{currencySymbol}{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-10">
              <div className="w-1/2">
                <table className="w-full text-sm">
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="py-1">Subtotal</td>
                      <td className="py-1 text-right font-medium text-black">{currencySymbol}{Number(invoice.subtotal).toFixed(2)}</td>
                    </tr>
                    {invoice.supply_type === 'intra-state' ? (
                      <>
                        <tr>
                          <td className="py-1">CGST</td>
                          <td className="py-1 text-right text-black">{currencySymbol}{(Number(invoice.tax_total) / 2).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-1">SGST</td>
                          <td className="py-1 text-right text-black">{currencySymbol}{(Number(invoice.tax_total) / 2).toFixed(2)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td className="py-1">IGST</td>
                        <td className="py-1 text-right text-black">{currencySymbol}{Number(invoice.tax_total).toFixed(2)}</td>
                      </tr>
                    )}
                    
                    <tr
                      className="font-bold text-lg"
                      style={{
                        borderTop: isMinimalist ? '1px solid #e5e7eb' : `2px solid ${primaryColor}`,
                        color: primaryColor,
                      }}
                    >
                      <td className="py-2 pt-4">Invoice Total</td>
                      <td className="py-2 pt-4 text-right">{currencySymbol}{Number(invoice.total).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-gray-200 pt-4 flex justify-between items-end">
              <div className="text-xs text-gray-500">
                <p className="font-bold mb-1 text-gray-600">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back.</p>
                <p>2. Subject to company jurisdiction.</p>
              </div>
              {showSignatory && (
                <div className="text-center w-48">
                  <div className="h-12 border-b border-gray-400 mb-2"></div>
                  <p className="text-xs font-medium text-gray-700">Authorized Signatory</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
