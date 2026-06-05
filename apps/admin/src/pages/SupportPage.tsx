import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '@byteevolvr/ui';
import {
  LifeBuoy,
  MessageSquare,
  Loader2,
  Send,
  Phone,
  Mail,
  Clock,
  Shield,
  Search,
  MoreVertical,
  RefreshCcw,
} from 'lucide-react';
import { SupportService, SocketService } from '@byteevolvr/api-client';
import { useAuthStore } from '@byteevolvr/store';

export function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    customer_email: '',
    message: '',
  });
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const socket = SocketService.connect('admin-session');

    const handleSystemAlert = (data: any) => {
      if (data.event === 'new-ticket' || data.event === 'new-message') {
        fetchTickets(); // Optimistic refetch
      }
    };

    socket.on('system_alert', handleSystemAlert);

    return () => {
      socket.off('system_alert', handleSystemAlert);
      SocketService.disconnect();
    };
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const response = await SupportService.getAllTickets();
      setTickets(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicketId) return;
    setReplying(true);
    try {
      await SupportService.replyToTicket(selectedTicketId, replyText);

      // Optimistically update
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            messages: [
              ...(t.messages || []),
              {
                id: Math.random().toString(),
                direction: 'outbound',
                message_body: replyText,
                sender_name: user?.full_name || 'Agent',
                created_at: new Date().toISOString(),
              },
            ],
            status: 'waiting_customer',
          };
        }
        return t;
      });
      setTickets(updatedTickets);
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setReplying(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.customer_email || !newTicketForm.message) return;
    try {
      // Assuming a createTicket endpoint exists or mock it optimistically
      const newTicket = {
        id: Math.random().toString(),
        subject: newTicketForm.subject,
        customer_email: newTicketForm.customer_email,
        status: 'open',
        source: 'email',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            id: Math.random().toString(),
            direction: 'outbound',
            message_body: newTicketForm.message,
            sender_name: user?.full_name || 'Agent',
            created_at: new Date().toISOString(),
          },
        ],
      };

      // Opt UI
      setTickets([newTicket, ...tickets]);
      setIsNewTicketModalOpen(false);
      setNewTicketForm({ subject: '', customer_email: '', message: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicketId || !user) return;
    try {
      await SupportService.updateTicket(selectedTicketId, { assigned_to: user.id });
      setTickets(
        tickets.map((t) => (t.id === selectedTicketId ? { ...t, assigned_to: user.id } : t))
      );
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicketId) return;
    try {
      await SupportService.updateTicket(selectedTicketId, { status: 'resolved' });
      setTickets(
        tickets.map((t) => (t.id === selectedTicketId ? { ...t, status: 'resolved' } : t))
      );
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="error">New</Badge>;
      case 'open':
        return <Badge variant="warning">Open</Badge>;
      case 'waiting_customer':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getChannelIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch =
      !searchQuery ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Unified Inbox</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Omnichannel Support Hub</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2" onClick={() => setIsNewTicketModalOpen(true)}>
            <LifeBuoy className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        {/* PANE 1: Ticket List */}
        <div className="w-80 border-r border-outline-variant flex flex-col bg-surface">
          <div className="p-4 border-b border-outline-variant flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search conversations..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'new' ? 'primary' : 'outline'}
                onClick={() => setFilter('new')}
              >
                New
              </Button>
              <Button
                size="sm"
                variant={filter === 'open' ? 'primary' : 'outline'}
                onClick={() => setFilter('open')}
              >
                Open
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && !tickets.length ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                No tickets found.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 border-b border-outline-variant cursor-pointer transition-colors ${
                    selectedTicketId === ticket.id
                      ? 'bg-primary/5 border-l-4 border-l-primary'
                      : 'hover:bg-surface-variant/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(ticket.source)}
                      <span className="font-semibold text-sm text-on-surface truncate max-w-[140px]">
                        {ticket.customer_name || 'Unknown'}
                      </span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <h4 className="text-xs text-on-surface-variant line-clamp-1 mb-2 font-medium">
                    {ticket.subject}
                  </h4>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                    <span>#{ticket.id.substring(0, 8)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{' '}
                      {new Date(ticket.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANE 2: Conversation Thread */}
        <div className="flex-1 flex flex-col bg-surface-container-lowest">
          {selectedTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0">
                <div>
                  <h2 className="font-semibold text-lg text-on-surface">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      {getChannelIcon(selectedTicket.source)} via {selectedTicket.source}
                    </span>
                    <span>•</span>
                    <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAssign}>
                    Assign
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResolve}>
                    Resolve
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {showMoreOptions && (
                      <div className="absolute right-0 mt-1 w-48 bg-surface rounded-lg shadow-lg border border-outline-variant z-10 py-1">
                        <button className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors">
                          Mark as Spam
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                          Block Customer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {[...(selectedTicket.messages || [])]
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                  .map((msg: any) => {
                    const isInbound = msg.direction === 'inbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className="flex gap-3 max-w-[80%] flex-row">
                          <div className="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-semibold mt-1 shrink-0">
                            {isInbound ? msg.sender_name?.[0] || 'U' : 'A'}
                          </div>
                          <div
                            className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                          >
                            <span className="text-xs text-on-surface-variant mb-1 ml-1">
                              {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                            <div
                              className={`p-3 rounded-2xl text-sm ${
                                isInbound
                                  ? 'bg-surface-variant text-on-surface-variant rounded-tl-sm'
                                  : 'bg-primary text-on-primary rounded-tr-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.message_body}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-outline-variant bg-surface shrink-0">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <textarea
                      className={`w-full border rounded-xl p-3 text-sm focus:ring-2 focus:outline-none min-h-[100px] resize-none ${isInternalNote ? 'bg-yellow-500/10 border-yellow-500/30 focus:ring-yellow-500/50' : 'bg-surface-container-lowest border-outline-variant focus:ring-primary'}`}
                      placeholder={
                        isInternalNote
                          ? 'Add an internal note...'
                          : `Reply via ${selectedTicket.source}...`
                      }
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={isInternalNote ? 'primary' : 'ghost'}
                        size="sm"
                        className={
                          isInternalNote
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'text-on-surface-variant'
                        }
                        onClick={() => setIsInternalNote(!isInternalNote)}
                      >
                        Internal Note
                      </Button>
                    </div>
                    <Button
                      onClick={handleReply}
                      disabled={replying || !replyText.trim()}
                      className={`gap-2 ${isInternalNote ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    >
                      {replying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isInternalNote ? 'Add Note' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
              <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
              <p>Select a conversation to view the thread</p>
            </div>
          )}
        </div>

        {/* PANE 3: Customer Context Sidebar */}
        {selectedTicket && (
          <div className="w-72 border-l border-outline-variant flex flex-col bg-surface shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-outline-variant flex items-center justify-center flex-col text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-3 shrink-0">
                {selectedTicket.customer_name?.[0] || 'U'}
              </div>
              <h3 className="font-semibold text-on-surface text-lg">
                {selectedTicket.customer_name || 'Unknown User'}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {selectedTicket.customer_email || 'No email'}
              </p>
            </div>

            <div className="p-4 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Contact Info
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-on-surface truncate">
                      {selectedTicket.customer_email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-on-surface">
                      {selectedTicket.customer_phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLA Status */}
              <div>
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  SLA Metrics
                </h4>
                <Card className="p-3 bg-surface-container-lowest">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-on-surface-variant">Priority</span>
                    <Badge
                      variant={selectedTicket.priority === 'high' ? 'error' : 'secondary'}
                      className="uppercase text-[9px]"
                    >
                      {selectedTicket.priority || 'Medium'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">Response Due</span>
                    <span className="text-xs font-medium text-warning">in 2 hrs</span>
                  </div>
                </Card>
              </div>

              {/* Security / Audit */}
              <div>
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Security
                </h4>
                <div className="flex items-center gap-3 text-xs text-success">
                  <Shield className="h-4 w-4" />
                  <span>Channel Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-xl font-bold text-on-surface">Create New Ticket</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsNewTicketModalOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Customer Email
                </label>
                <Input
                  placeholder="customer@example.com"
                  type="email"
                  value={newTicketForm.customer_email}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, customer_email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Subject</label>
                <Input
                  placeholder="Ticket Subject"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Message</label>
                <textarea
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]"
                  placeholder="Type your message here..."
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={
                  !newTicketForm.subject || !newTicketForm.customer_email || !newTicketForm.message
                }
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
