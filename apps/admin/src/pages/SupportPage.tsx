import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge } from '../components/ui';
import { LifeBuoy, MoreVertical, MessageSquare, Loader2, RefreshCcw } from 'lucide-react';
import { SupportService } from '@byteevolvr/api-client';

export function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const response = await SupportService.getAllTickets();
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-error';
      case 'in_progress':
        return 'bg-warning';
      case 'resolved':
        return 'bg-success';
      default:
        return 'bg-outline';
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Support Hub</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage customer inquiries and system issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2">
            <LifeBuoy className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Fetching support tickets...</p>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Kanban Board Columns */}
          {['open', 'in_progress', 'resolved'].map((columnStatus) => (
            <div
              key={columnStatus}
              className={`flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant p-4 ${columnStatus === 'resolved' ? 'opacity-80' : ''}`}
            >
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
                <h3 className="font-semibold text-on-surface flex items-center gap-2 capitalize">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(columnStatus)}`}></div>
                  {columnStatus.replace('_', ' ')}
                  <Badge variant="default" className="ml-2">
                    {tickets.filter((t) => t.status === columnStatus).length}
                  </Badge>
                </h3>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {tickets.filter((t) => t.status === columnStatus).length === 0 ? (
                  <div className="text-center py-10 text-xs text-on-surface-variant italic">
                    No tickets in this column
                  </div>
                ) : (
                  tickets
                    .filter((t) => t.status === columnStatus)
                    .map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="cursor-pointer hover:border-primary transition-all active:scale-[0.98]"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                              #{ticket.id.substring(0, 8)}
                            </span>
                            <Badge
                              variant={
                                ticket.priority === 'high' || ticket.priority === 'urgent'
                                  ? 'error'
                                  : 'default'
                              }
                              className="text-[9px] py-0 px-1.5 uppercase"
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm text-on-surface mb-2 line-clamp-2">
                            {ticket.subject}
                          </h4>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-on-surface-variant truncate max-w-[100px]">
                              {ticket.user?.full_name || 'Anonymous'}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                              <MessageSquare className="h-3 w-3" />{' '}
                              {new Date(ticket.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
