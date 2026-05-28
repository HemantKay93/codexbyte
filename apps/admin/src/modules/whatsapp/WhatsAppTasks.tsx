import { useEffect, useState } from 'react';
import { Play, Pause, RefreshCw, Trash2, AlertCircle, ListTodo, History } from 'lucide-react';
import { apiClient } from '@byteevolvr/api-client';
import { toast } from 'sonner';

export function WhatsAppTasks() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [tasks, setTasks] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 50;

  const fetchData = async () => {
    try {
      if (activeTab === 'queue') {
        const res = await apiClient.get('/whatsapp/tasks');
        // interceptor unwraps {success, data} → res.data is the array
        setTasks(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await apiClient.get(`/whatsapp/logs?limit=${limit}&page=${page}`);
        // getLogs returns {success, data:[...], count, page, limit}
        // after interceptor unwrap: res.data = {data:[...], count, page, limit}
        // BUT if interceptor sees {success:true, data:X} it returns X directly
        // So res.data could be the array directly OR the full object
        const payload = res.data;
        if (Array.isArray(payload)) {
          setHistoryLogs(payload);
          setTotalLogs(payload.length);
        } else {
          setHistoryLogs(payload?.data || []);
          setTotalLogs(payload?.count || 0);
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [activeTab, page]);

  const toggleQueue = async () => {
    try {
      const endpoint = isPaused ? '/whatsapp/queue/resume' : '/whatsapp/queue/pause';
      const res = await apiClient.post(endpoint);
      if (res.data) {
        setIsPaused(!isPaused);
        toast.success(`Queue ${isPaused ? 'resumed' : 'paused'} successfully`);
      }
    } catch {
      toast.error('Failed to toggle queue state');
    }
  };

  const retryTask = async (id: string) => {
    try {
      const res = await apiClient.post(`/whatsapp/tasks/${id}/retry`);
      if (res.data) {
        toast.success('Task queued for retry');
        fetchData();
      }
    } catch {
      toast.error('Failed to retry task');
    }
  };

  const bulkRetryFailed = async () => {
    try {
      const res = await apiClient.post('/whatsapp/tasks/retry-failed');
      if (res.data) {
        toast.success(res.data.message || 'Bulk retry initiated');
        fetchData();
      }
    } catch {
      toast.error('Failed to bulk retry tasks');
    }
  };

  const cancelTask = async (id: string) => {
    try {
      const res = await apiClient.delete(`/whatsapp/tasks/${id}`);
      if (res.data) {
        toast.success('Task cancelled');
        fetchData();
      }
    } catch {
      toast.error('Failed to cancel task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Task Queue Manager</h2>
          <p className="text-sm text-on-surface-variant">
            Monitor and manage outbound WhatsApp messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'queue' && tasks.some((t) => t.state === 'failed') && (
            <button
              onClick={bulkRetryFailed}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Bulk Retry Failed
            </button>
          )}
          <button
            onClick={toggleQueue}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
              isPaused ? 'bg-primary text-on-primary' : 'bg-error text-on-error'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume All Sending' : 'Pause All Sending'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-outline-variant pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'queue'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ListTodo className="w-4 h-4" /> Active Queue (BullMQ)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <History className="w-4 h-4" /> Task History (DB Logs)
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        {loading && tasks.length === 0 && historyLogs.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">Loading data...</div>
        ) : activeTab === 'queue' ? (
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No tasks currently in the queue
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface">
                      #{task.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      {task.data?.to || task.data?.payload?.to || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.state === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : task.state === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : task.state === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.state}
                      </span>
                      {task.failedReason && (
                        <div
                          className="mt-1 flex items-center text-xs text-error max-w-xs truncate"
                          title={task.failedReason}
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {task.failedReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      {task.attemptsMade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(task.state === 'failed' || task.state === 'waiting') && (
                        <>
                          <button
                            onClick={() => retryTask(task.id)}
                            className="text-primary hover:text-primary-dark mr-4"
                          >
                            <RefreshCw className="w-4 h-4 inline" /> Retry
                          </button>
                          <button
                            onClick={() => cancelTask(task.id)}
                            className="text-error hover:text-error-dark"
                          >
                            <Trash2 className="w-4 h-4 inline" /> Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <>
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Error Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      No historical tasks found
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                        {log.recipient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.status === 'sent' || log.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {(log.status || 'unknown').toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate"
                        title={log.error_log}
                      >
                        {log.error_log || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {activeTab === 'history' && totalLogs > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant bg-surface-container">
                <span className="text-sm text-on-surface-variant">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of{' '}
                  {totalLogs}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-sm border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page * limit >= totalLogs}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-sm border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
