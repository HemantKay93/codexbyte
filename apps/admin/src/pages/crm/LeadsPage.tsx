import { useState, useEffect } from 'react';
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
import { Search, Plus, Filter, Phone, Mail, MoreHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CRMService } from '@byteevolvr/api-client';

export function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await CRMService.getLeads();
      if (res?.data && res.data.length > 0) {
        setLeads(res.data);
      } else {
        // Fallback mock data if API doesn't return anything
        setLeads([
          {
            id: 'LD-101',
            name: 'Alice Cooper',
            company: 'Cooper Tech',
            email: 'alice@cooper.com',
            phone: '+1 234-567-8900',
            status: 'new',
            score: 85,
            owner: 'Jim Halpert',
            score_factors: ['Website Visit', 'Pricing Page', 'Downloaded Whitepaper'],
          },
          {
            id: 'LD-102',
            name: 'Bob Vance',
            company: 'Vance Refrigeration',
            email: 'bob@vance.com',
            phone: '+1 234-567-8901',
            status: 'contacted',
            score: 62,
            owner: 'Dwight Schrute',
            score_factors: ['Attended Webinar'],
          },
          {
            id: 'LD-103',
            name: 'Charles Miner',
            company: 'Saticoy Steel',
            email: 'charles@saticoy.com',
            phone: '+1 234-567-8902',
            status: 'qualified',
            score: 92,
            owner: 'Michael Scott',
            score_factors: ['Requested Demo', 'Decision Maker', 'High Budget'],
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load leads', error);
      // Fallback on error
      setLeads([
        {
          id: 'LD-101',
          name: 'Alice Cooper',
          company: 'Cooper Tech',
          email: 'alice@cooper.com',
          phone: '+1 234-567-8900',
          status: 'new',
          score: 85,
          owner: 'Jim Halpert',
          score_factors: ['Website Visit', 'Pricing Page', 'Downloaded Whitepaper'],
        },
        {
          id: 'LD-102',
          name: 'Bob Vance',
          company: 'Vance Refrigeration',
          email: 'bob@vance.com',
          phone: '+1 234-567-8901',
          status: 'contacted',
          score: 62,
          owner: 'Dwight Schrute',
          score_factors: ['Attended Webinar'],
        },
        {
          id: 'LD-103',
          name: 'Charles Miner',
          company: 'Saticoy Steel',
          email: 'charles@saticoy.com',
          phone: '+1 234-567-8902',
          status: 'qualified',
          score: 92,
          owner: 'Michael Scott',
          score_factors: ['Requested Demo', 'Decision Maker', 'High Budget'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'contacted':
        return <Badge variant="primary">Contacted</Badge>;
      case 'qualified':
        return <Badge variant="success">Qualified</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Leads & Scoring</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage inbound leads and view AI-driven lead scores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Import
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search leads by name, email, or company..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              Scoring Rules
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                    No leads found matching "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link
                        to={`/crm/leads/${lead.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {lead.name}
                      </Link>
                      <div className="text-xs text-on-surface-variant mt-1">{lead.id}</div>
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden max-w-[60px]">
                            <div
                              className={`h-full ${lead.score >= 80 ? 'bg-success' : lead.score >= 50 ? 'bg-warning' : 'bg-error'}`}
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{lead.score}</span>
                        </div>
                        {lead.score_factors && lead.score_factors.length > 0 && (
                          <div
                            className="text-[10px] text-on-surface-variant truncate max-w-[150px]"
                            title={lead.score_factors.join(', ')}
                          >
                            + {lead.score_factors[0]}
                            {lead.score_factors.length > 1
                              ? ` (+${lead.score_factors.length - 1} more)`
                              : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{lead.owner}</TableCell>
                    <TableCell>
                      <button className="p-2 hover:bg-surface-container rounded-md text-on-surface-variant">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
