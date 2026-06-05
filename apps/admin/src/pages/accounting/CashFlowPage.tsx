import { Card, Button } from '@byteevolvr/ui';
import { Download, Calendar, Activity } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function CashFlowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Statement of Cash Flows
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            For the period Oct 1, 2023 to Oct 31, 2023
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Select Period
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-l-4 border-l-success">
          <p className="text-sm text-on-surface-variant mb-1">Operating Activities</p>
          <h3 className="text-2xl font-bold text-success">+₹4,50,000.00</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Investing Activities</p>
          <h3 className="text-2xl font-bold text-error">-₹1,20,000.00</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-primary">
          <p className="text-sm text-on-surface-variant mb-1">Financing Activities</p>
          <h3 className="text-2xl font-bold text-primary">+₹0.00</h3>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center gap-2 text-on-surface">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-semibold">Cash Flow Breakdown</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-48">Amount (INR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Operating Activities */}
            <TableRow className="bg-surface-container-lowest font-medium">
              <TableCell colSpan={2} className="text-on-surface pt-6">
                Cash Flows from Operating Activities
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant">Net Income</TableCell>
              <TableCell className="text-right">₹3,80,000.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant">
                Depreciation & Amortization
              </TableCell>
              <TableCell className="text-right">₹45,000.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant">
                Decrease in Accounts Receivable
              </TableCell>
              <TableCell className="text-right">₹50,000.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant">
                Increase in Accounts Payable
              </TableCell>
              <TableCell className="text-right">₹25,000.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant border-b border-outline-variant">
                Increase in Inventory
              </TableCell>
              <TableCell className="text-right border-b border-outline-variant">
                -₹50,000.00
              </TableCell>
            </TableRow>
            <TableRow className="font-semibold">
              <TableCell className="pl-4">Net Cash from Operating Activities</TableCell>
              <TableCell className="text-right text-success">₹4,50,000.00</TableCell>
            </TableRow>

            {/* Investing Activities */}
            <TableRow className="bg-surface-container-lowest font-medium">
              <TableCell colSpan={2} className="text-on-surface pt-6">
                Cash Flows from Investing Activities
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant border-b border-outline-variant">
                Purchase of Equipment
              </TableCell>
              <TableCell className="text-right border-b border-outline-variant">
                -₹1,20,000.00
              </TableCell>
            </TableRow>
            <TableRow className="font-semibold">
              <TableCell className="pl-4">Net Cash from Investing Activities</TableCell>
              <TableCell className="text-right text-error">-₹1,20,000.00</TableCell>
            </TableRow>

            {/* Financing Activities */}
            <TableRow className="bg-surface-container-lowest font-medium">
              <TableCell colSpan={2} className="text-on-surface pt-6">
                Cash Flows from Financing Activities
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-on-surface-variant border-b border-outline-variant">
                Issuance of Debt/Equity
              </TableCell>
              <TableCell className="text-right border-b border-outline-variant">₹0.00</TableCell>
            </TableRow>
            <TableRow className="font-semibold">
              <TableCell className="pl-4">Net Cash from Financing Activities</TableCell>
              <TableCell className="text-right text-on-surface">₹0.00</TableCell>
            </TableRow>

            {/* Totals */}
            <TableRow className="bg-surface-container-low font-bold text-lg mt-4">
              <TableCell className="pt-6">Net Increase in Cash</TableCell>
              <TableCell className="text-right pt-6 text-primary">₹3,30,000.00</TableCell>
            </TableRow>
            <TableRow className="bg-surface-container-low font-bold text-lg">
              <TableCell>Cash at Beginning of Period</TableCell>
              <TableCell className="text-right">₹14,20,000.50</TableCell>
            </TableRow>
            <TableRow className="bg-surface-container-low font-bold text-lg border-t-2 border-outline">
              <TableCell>Cash at End of Period</TableCell>
              <TableCell className="text-right">₹17,50,000.50</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
