import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { Plus, Search, Filter, MoreHorizontal, Shield, Mail } from 'lucide-react';
import { getTeamMembers } from '@byteevolvr/api-client';

const mockTeam = [
  { id: '1', name: 'Admin User', email: 'admin@byteevolvr.com', role: 'Super Admin', status: 'active', lastActive: 'Just now' },
  { id: '2', name: 'John Doe', email: 'john@byteevolvr.com', role: 'Store Manager', status: 'active', lastActive: '2 hours ago' },
  { id: '3', name: 'Jane Smith', email: 'jane@byteevolvr.com', role: 'Support Agent', status: 'active', lastActive: 'Yesterday' },
  { id: '4', name: 'Mike Ross', email: 'mike@byteevolvr.com', role: 'Support Agent', status: 'invited', lastActive: 'Never' },
];

export function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await getTeamMembers();
        if (data && data.length > 0) {
          const mapped = data.map((user: any) => ({
            id: user.id,
            name: user.full_name || user.email.split('@')[0],
            email: user.email,
            role: user.role === 'admin' ? 'Super Admin' : 'Store Manager',
            status: 'active',
            lastActive: new Date(user.updated_at).toLocaleDateString()
          }));
          setTeam(mapped);
        } else {
          setTeam(mockTeam);
        }
      } catch (error) {
        console.warn('Failed to fetch team members, falling back to mock:', error);
        setTeam(mockTeam);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Team Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage staff access and roles</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search team members..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">Loading team...</TableCell>
                </TableRow>
              ) : team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-on-surface">{member.name}</div>
                        <div className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <Shield className={`h-4 w-4 ${member.role === 'Super Admin' ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <span className={member.role === 'Super Admin' ? 'font-semibold' : ''}>{member.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === 'active' ? 'success' : 'warning'
                      }
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-on-surface-variant">{member.lastActive}</TableCell>
                  <TableCell>
                    <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
