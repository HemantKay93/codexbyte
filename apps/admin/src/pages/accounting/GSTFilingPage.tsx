import { useState, useRef } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Download, UploadCloud, AlertCircle } from 'lucide-react';

export function GSTFilingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert(`Successfully imported data from ${file.name}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000);
    }
  };

  const handleExportGSTR1 = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Invoice Number,Date,Customer,GSTIN,Total Value,Taxable Value,IGST,CGST,SGST\n"
      + "INV-001,2026-05-01,Acme Corp,29ABCDE1234F1Z5,1180,1000,180,0,0\n"
      + "INV-002,2026-05-05,Local Shop,29QWERT9876A1Z3,590,500,0,45,45\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "GSTR-1_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGSTR3B = () => {
    window.print();
  };
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">GST Filing & Export</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Generate GSTR-1 and GSTR-3B compatible reports
          </p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <UploadCloud className="h-4 w-4" /> {isUploading ? 'Uploading...' : 'Import External (Amazon/Meesho)'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Export GSTR-1 (Sales)</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Export B2B and B2C sales data in government-approved CSV format for the selected month.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Select Month
              </label>
              <select className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                <option>May 2026</option>
                <option>April 2026</option>
                <option>March 2026</option>
              </select>
            </div>

            <div className="p-3 bg-surface-container-low border border-outline-variant rounded-md flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-on-surface-variant leading-relaxed">
                This export will include all internal POS sales, web store sales, and imported
                marketplace sales for the selected period.
              </div>
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleExportGSTR1}>
            <Download className="h-4 w-4" /> Download GSTR-1 CSV
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Export GSTR-3B (Summary)</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Export the monthly summary of outward supplies, inward supplies, and Input Tax Credit
            (ITC).
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Select Month
              </label>
              <select className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                <option>May 2026</option>
                <option>April 2026</option>
                <option>March 2026</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-md text-center">
                <div className="text-xs text-on-surface-variant mb-1">Output Tax</div>
                <div className="font-bold text-lg">₹2,61,000</div>
              </div>
              <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-md text-center">
                <div className="text-xs text-on-surface-variant mb-1">ITC</div>
                <div className="font-bold text-lg text-success">₹75,600</div>
              </div>
            </div>
          </div>

          <Button className="w-full gap-2" variant="outline" onClick={handleExportGSTR3B}>
            <Download className="h-4 w-4" /> Download GSTR-3B PDF
          </Button>
        </Card>
      </div>
    </div>
  );
}
