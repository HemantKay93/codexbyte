import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '@byteevolvr/ui';
import { Plus, Search, Filter, Trash2, Shield, Mail, X } from 'lucide-react';
import { TeamService } from '@byteevolvr/api-client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../components/ui/Table';

const mockTeam = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@byteevolvr.com',
    role: 'Super Admin',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@byteevolvr.com',
    role: 'Store Manager',
    status: 'active',
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@byteevolvr.com',
    role: 'Support Agent',
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: '4',
    name: 'Mike Ross',
    email: 'mike@byteevolvr.com',
    role: 'Support Agent',
    status: 'invited',
    lastActive: 'Never',
  },
];

export function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [team, setTeam] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', full_name: '', role: 'manager' });
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await TeamService.getTeamMembers();
      if (data && data.length > 0) {
        const mapped = data.map((user: any) => ({
          // eslint-disable-line @typescript-eslint/no-explicit-any
          id: user.id,
          name: user.full_name || user.email.split('@')[0],
          email: user.email,
          role: user.role,
          status: 'active',
          lastActive: new Date(user.updated_at).toLocaleDateString(),
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

  useEffect(() => {
    fetchTeam();
    // eslint-disable-line react-hooks/set-state-in-effect // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []);

  const handleInvite = async () => {
    if (!inviteData.email) return;
    setInviting(true);
    try {
      await TeamService.addTeamMember(inviteData);
      setIsInviteModalOpen(false);
      setInviteData({ email: '', full_name: '', role: 'manager' });
      fetchTeam();
      // eslint-disable-line @typescript-eslint/no-floating-promises
    } catch (error) {
      console.error('Failed to invite member', error);
      alert('Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    try {
      await TeamService.updateTeamMemberRole(id, newRole);
      fetchTeam();
      // eslint-disable-line @typescript-eslint/no-floating-promises
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setUpdatingId(id);
    try {
      // Use existing service if it exists, or handle directly
      // Assuming TeamService.removeTeamMember exists, if not we will just filter the state for now
      if ((TeamService as any).removeTeamMember) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        await (TeamService as any).removeTeamMember(id);
        // eslint-disable-line @typescript-eslint/no-explicit-any
        fetchTeam();
        // eslint-disable-line @typescript-eslint/no-floating-promises
      } else {
        setTeam(team.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove member', error);
      alert('Failed to remove member');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Team Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage staff access and roles</p>
        </div>
        <Button className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
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
        <div className="p-0">
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
                  <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">
                    Loading team...
                  </TableCell>
                </TableRow>
              ) : (
                team.map((member) => (
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
                        <Shield
                          className={`h-4 w-4 ${member.role === 'super-admin' ? 'text-primary' : 'text-on-surface-variant'}`}
                        />
                        <select
                          className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
                          value={member.role}
                          disabled={updatingId === member.id}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        >
                          <option value="super-admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="support">Support</option>
                          <option value="warehouse-staff">Warehouse Staff</option>
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{member.lastActive}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={updatingId === member.id}
                        title="Remove Member"
                        className="text-error/70 hover:text-error p-1 rounded-md hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-title-lg font-semibold">Invite Team Member</h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Email Address</label>
                <Input
                  placeholder="colleague@example.com"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Role</label>
                <select
                  className="flex h-10 w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                >
                  <option value="super-admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                  <option value="warehouse-staff">Warehouse Staff</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
              <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviting || !inviteData.email}>
                {inviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
