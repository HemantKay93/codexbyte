import { Card, Button, Badge } from '@byteevolvr/ui';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';;
import { FileText, Building, Landmark, PieChart } from 'lucide-react';

export function TaxCompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Tax & Compliance</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            India GST reporting and compliance dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Generate GSTR-1
          </Button>
          <Button className="gap-2 bg-primary text-on-primary">
            <FileText className="h-4 w-4" /> Generate GSTR-3B
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-5 w-5 text-primary" />
              <div className="text-primary font-medium text-sm">
                Total GST Collected (Current Month)
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">₹1,42,500.00</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-5 w-5 text-on-surface-variant" />
              <div className="text-on-surface-variant font-medium text-sm">IGST (Inter-state)</div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹85,000.00</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="h-5 w-5 text-on-surface-variant" />
              <div className="text-on-surface-variant font-medium text-sm">
                CGST + SGST (Intra-state)
              </div>
            </div>
            <div className="text-3xl font-bold text-on-surface">₹57,500.00</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-outline-variant">
          <h2 className="text-lg font-semibold text-on-surface">Tax Rules Configuration</h2>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Profile</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>HSN/SAC Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-on-surface">Standard Rate 18%</TableCell>
                <TableCell>
                  <Badge variant="secondary">18%</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-on-surface-variant">8518</TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  Electronics, Headphones, Peripherals
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-on-surface">Reduced Rate 5%</TableCell>
                <TableCell>
                  <Badge variant="secondary">5%</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-on-surface-variant">6201</TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  Apparel (Value below ₹1000)
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-on-surface">Standard Rate 12%</TableCell>
                <TableCell>
                  <Badge variant="secondary">12%</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-on-surface-variant">6201</TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  Apparel (Value above ₹1000)
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
