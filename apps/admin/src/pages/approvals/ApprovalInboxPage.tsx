import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ApprovalsService } from '@byteevolvr/api-client';

export function ApprovalInboxPage() {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<any[]>([]);

  const fetchInbox = async () => {
    try {
      const res = await ApprovalsService.getInbox();
      setInbox(res.data);
    } catch (error) {
      console.error('Failed to load inbox', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchInbox();
  }, []);

  const handleAction = async (
    requestId: string,
    stepId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      await ApprovalsService.processStep(requestId, stepId, status);
      fetchInbox(); // Refresh
    } catch (error) {
      console.error(`Failed to mark ${status}`, error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Approval Inbox</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Review and manage requests requiring your approval.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4 opacity-50" />
            <p className="text-lg font-semibold">You're all caught up!</p>
            <p className="text-sm">No pending approvals require your action.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {inbox.map((step) => {
              const req = step.approval_requests;
              const template = req?.approval_templates;

              return (
                <div
                  key={step.id}
                  className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-surface-container-lowest transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                        {template?.module || 'SYSTEM'}
                      </span>
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {template?.name || 'General Approval'}
                      </span>
                      <span className="flex items-center text-xs text-on-surface-variant gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(req?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-on-surface font-medium">
                      Request ID: {req?.id?.split('-')[0]}... requires your attention for entity{' '}
                      {req?.entity_id?.split('-')[0]}...
                    </p>
                    <div className="text-sm bg-surface-container-low p-3 rounded-md font-mono text-on-surface-variant overflow-x-auto border border-outline-variant">
                      {JSON.stringify(req?.payload, null, 2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500/30 hover:bg-red-50"
                      onClick={() => handleAction(req.id, step.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(req.id, step.id, 'approved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
