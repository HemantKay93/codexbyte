import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Search, Plus, Filter, FileText, Send, Scale, CheckCircle2 } from 'lucide-react';

export function PurchaseRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'rfqs' | 'comparisons'>('requests');

  // Mock data
  const requests = [
    {
      id: 'PR-23-001',
      department: 'IT',
      requestor: 'Michael Scott',
      date: '2023-10-15',
      items: 3,
      estimatedValue: 4500.0,
      status: 'approved',
    },
    {
      id: 'PR-23-002',
      department: 'Marketing',
      requestor: 'Pam Beesly',
      date: '2023-10-18',
      items: 1,
      estimatedValue: 1200.0,
      status: 'pending',
    },
    {
      id: 'PR-23-003',
      department: 'Sales',
      requestor: 'Jim Halpert',
      date: '2023-10-20',
      items: 5,
      estimatedValue: 8500.0,
      status: 'rejected',
    },
  ];

  const rfqs = [
    {
      id: 'RFQ-2023-045',
      prId: 'PR-23-001',
      title: 'Q4 Developer Laptops',
      deadline: '2023-11-01',
      vendorsInvited: 4,
      quotesReceived: 3,
      status: 'active',
    },
    {
      id: 'RFQ-2023-046',
      prId: 'PR-23-002',
      title: 'Marketing Event Swag',
      deadline: '2023-10-25',
      vendorsInvited: 3,
      quotesReceived: 3,
      status: 'closed',
    },
  ];

  const comparisons = [
    {
      id: 'COMP-046',
      rfqId: 'RFQ-2023-046',
      title: 'Marketing Event Swag',
      quotes: [
        { vendor: 'PromoWorld', amount: 1150.0, deliveryDays: 14, score: 85 },
        { vendor: 'SwagMagic', amount: 1200.0, deliveryDays: 7, score: 92, recommended: true },
        { vendor: 'BrandIt', amount: 950.0, deliveryDays: 21, score: 70 },
      ],
      status: 'pending_approval',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Purchase Requests & RFQs
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage internal requests, solicit quotes, and compare vendor offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <div className="flex border-b border-outline-variant mb-6">
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('requests')}
        >
          All Requests
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rfqs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('rfqs')}
        >
          RFQs
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comparisons' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('comparisons')}
        >
          Quotation Comparison
        </button>
      </div>

      {activeTab === 'requests' && (
        <Card>
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search by ID or requestor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR Number</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Est. Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-on-surface-variant" />
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {item.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.requestor}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'approved'
                          ? 'success'
                          : item.status === 'pending'
                            ? 'default'
                            : 'error'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'approved' ? (
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <Send className="h-3 w-3" /> Convert to RFQ
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'rfqs' && (
        <Card>
          <div className="p-4 border-b border-outline-variant">
            <h3 className="font-semibold">Active RFQs (Requests for Quotation)</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Linked PR</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                    {rfq.id}
                  </TableCell>
                  <TableCell>{rfq.title}</TableCell>
                  <TableCell className="text-on-surface-variant text-sm">{rfq.prId}</TableCell>
                  <TableCell>{new Date(rfq.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {rfq.quotesReceived} / {rfq.vendorsInvited} Responded
                  </TableCell>
                  <TableCell>
                    <Badge variant={rfq.status === 'active' ? 'primary' : 'default'}>
                      {rfq.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Scale className="h-3 w-3" /> Compare Quotes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'comparisons' && (
        <div className="space-y-4">
          {comparisons.map((comp) => (
            <Card key={comp.id} className="p-0 overflow-hidden">
              <div className="bg-surface-variant/30 p-4 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {comp.title}{' '}
                    <span className="text-sm font-normal text-on-surface-variant ml-2">
                      ({comp.rfqId})
                    </span>
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Select the best vendor quote to generate a Purchase Order.
                  </p>
                </div>
                <Badge variant="warning">Awaiting Decision</Badge>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {comp.quotes.map((q, idx) => (
                    <Card
                      key={idx}
                      className={`p-4 border-2 ${q.recommended ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
                    >
                      {q.recommended && (
                        <div className="flex items-center gap-1 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4" /> System Recommended
                        </div>
                      )}
                      <h4 className="font-bold text-xl mb-4">{q.vendor}</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Total Amount:</span>
                          <span className="font-bold">
                            ₹{q.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Delivery:</span>
                          <span className="font-medium">{q.deliveryDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Vendor Score:</span>
                          <span
                            className={
                              q.score > 80 ? 'text-success font-medium' : 'text-warning font-medium'
                            }
                          >
                            {q.score}/100
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-6"
                        variant={q.recommended ? 'primary' : 'outline'}
                      >
                        Approve & Generate PO
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
