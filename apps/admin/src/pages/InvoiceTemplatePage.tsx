import { Card, CardContent, Button, Input } from '../components/ui';
import { Save, Eye, Palette } from 'lucide-react';

export function InvoiceTemplatePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            B2B GST Invoice Template
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Design and configure standard tax invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" /> Preview PDF
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" /> Save Template
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 shrink-0 overflow-y-auto space-y-4">
          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center gap-2">
              <Building2Icon />
              <h3 className="font-semibold text-on-surface">Company Details</h3>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Company Name
                </label>
                <Input defaultValue="ByteEvolvr Technologies Pvt Ltd" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  GSTIN
                </label>
                <Input defaultValue="27AABCU9603R1ZN" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  PAN
                </label>
                <Input defaultValue="AABCU9603R" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Registered Address
                </label>
                <textarea
                  className="w-full bg-surface border border-outline rounded p-2 text-sm"
                  rows={3}
                  defaultValue="101, Tech Park, Andheri East, Mumbai, Maharashtra 400069"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center gap-2">
              <Palette className="h-4 w-4 text-on-surface-variant" />
              <h3 className="font-semibold text-on-surface">Styling</h3>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue="#004ac6"
                    className="h-8 w-12 rounded cursor-pointer"
                  />
                  <Input defaultValue="#004ac6" className="flex-1" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">Show Logo</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">
                  Show Authorized Signatory
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Pane */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white border border-outline shadow-sm p-10 min-h-[800px]">
            {/* Mock Invoice Visual */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-6">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">ByteEvolvr</div>
                <div className="text-xs text-on-surface-variant">
                  ByteEvolvr Technologies Pvt Ltd
                  <br />
                  101, Tech Park, Andheri East
                  <br />
                  Mumbai, Maharashtra 400069
                  <br />
                  GSTIN: 27AABCU9603R1ZN
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-on-surface mb-2 uppercase tracking-widest text-primary">
                  Tax Invoice
                </h2>
                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 text-on-surface-variant">
                  <span>Invoice No:</span>{' '}
                  <span className="font-semibold text-on-surface">INV-2026-0042</span>
                  <span>Date:</span>{' '}
                  <span className="font-semibold text-on-surface">02-May-2026</span>
                  <span>Place of Supply:</span>{' '}
                  <span className="font-semibold text-on-surface">Maharashtra (27)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2 border-b border-outline pb-1">
                  Billed To
                </h4>
                <div className="text-sm">
                  <p className="font-bold text-on-surface">Acme Corp Ltd</p>
                  <p className="text-on-surface-variant">
                    55 Business Road, Sector 4<br />
                    Pune, Maharashtra 411001
                  </p>
                  <p className="text-on-surface-variant mt-1">GSTIN: 27XYZABC1234F1Z5</p>
                </div>
              </div>
            </div>

            <table className="w-full text-sm mb-8">
              <thead>
                <tr className="bg-primary/5 border-y border-primary/20">
                  <th className="text-left py-2 px-2 font-semibold">Description</th>
                  <th className="text-center py-2 px-2 font-semibold">HSN/SAC</th>
                  <th className="text-right py-2 px-2 font-semibold">Qty</th>
                  <th className="text-right py-2 px-2 font-semibold">Rate</th>
                  <th className="text-right py-2 px-2 font-semibold">Taxable Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-outline-variant">
                  <td className="py-3 px-2">Premium Wireless Headphones</td>
                  <td className="text-center py-3 px-2">8518</td>
                  <td className="text-right py-3 px-2">10</td>
                  <td className="text-right py-3 px-2">₹25,000.00</td>
                  <td className="text-right py-3 px-2">₹2,50,000.00</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end mb-10">
              <div className="w-1/2">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-on-surface-variant">Total Taxable Value</td>
                      <td className="py-1 text-right font-medium">₹2,50,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-on-surface-variant">CGST @ 9%</td>
                      <td className="py-1 text-right">₹22,500.00</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-on-surface-variant">SGST @ 9%</td>
                      <td className="py-1 text-right">₹22,500.00</td>
                    </tr>
                    <tr className="border-t-2 border-primary font-bold text-lg">
                      <td className="py-2 text-primary">Invoice Total</td>
                      <td className="py-2 text-right text-primary">₹2,95,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-auto border-t border-outline pt-4 flex justify-between items-end">
              <div className="text-xs text-on-surface-variant">
                <p className="font-bold mb-1">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back.</p>
                <p>2. Subject to Mumbai jurisdiction.</p>
              </div>
              <div className="text-center w-48">
                <div className="h-12 border-b border-outline mb-2"></div>
                <p className="text-xs font-medium">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Building2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-building-2 h-4 w-4 text-on-surface-variant"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
