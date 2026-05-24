export interface WhatsAppMessagePayload {
  to: string;
  content: string;
  type?: 'text' | 'image' | 'document' | 'template';
  mediaUrl?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface WhatsAppJobData {
  jobId?: string;
  payload: WhatsAppMessagePayload;
  priority?: number;
}

export interface WhatsAppSession {
  id: string;
  session_name: string;
  status: 'connected' | 'disconnected' | 'authenticating' | 'qr_ready';
  qr_code?: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageRecord {
  id: string;
  job_id?: string;
  recipient: string;
  payload: Record<string, any>;
  status: 'queued' | 'sent' | 'failed' | 'delivered';
  error_log?: string;
  created_at: string;
  updated_at: string;
}
