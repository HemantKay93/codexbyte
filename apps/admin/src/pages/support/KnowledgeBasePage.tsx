import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Filter, FileText, Globe, Lock } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const articles = [
    {
      id: 'KB-101',
      title: 'How to reset your password',
      category: 'Authentication',
      views: 1245,
      status: 'published',
      visibility: 'public',
      lastUpdated: '2023-10-15',
    },
    {
      id: 'KB-102',
      title: 'Setting up 2FA via Authenticator',
      category: 'Security',
      views: 856,
      status: 'published',
      visibility: 'public',
      lastUpdated: '2023-10-10',
    },
    {
      id: 'KB-103',
      title: 'Internal Guide: Handling Refunds',
      category: 'Operations',
      views: 112,
      status: 'published',
      visibility: 'internal',
      lastUpdated: '2023-10-20',
    },
    {
      id: 'KB-104',
      title: 'Configuring API Webhooks',
      category: 'Developers',
      views: 0,
      status: 'draft',
      visibility: 'public',
      lastUpdated: '2023-10-25',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Knowledge Base</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage help articles, FAQs, and internal documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Categories</Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search articles by title or keyword..."
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
              <TableHead>Article Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <div>
                      <div className="font-medium text-primary hover:underline cursor-pointer">
                        {item.title}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{item.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    {item.visibility === 'public' ? (
                      <>
                        <Globe className="h-3.5 w-3.5 text-on-surface-variant" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-warning" /> Internal
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.views.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'published' ? 'success' : 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-on-surface-variant">
                  {new Date(item.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
