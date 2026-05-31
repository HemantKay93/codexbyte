import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';
import { SocketGateway } from '../../core/notifications/SocketGateway.js';

export class SupportInboxService {
  /**
   * Process inbound WhatsApp messages
   */
  async processInboundWhatsApp(data: { message: any; senderPhone: string; senderName: string; raw_payload: any }) {
    const { message, senderPhone, senderName, raw_payload } = data;
    const body = message.text?.body || '';

    // 1. Look for an ACTIVE ticket for this phone number
    const activeTicket = await this.findActiveTicketByPhone(senderPhone);

    if (activeTicket) {
      // Append message to existing ticket
      await this.appendMessage(activeTicket.id, 'whatsapp', 'inbound', body, senderName, null, senderPhone, raw_payload);
      return;
    }

    // 2. No active ticket. Check for keywords.
    const keywords = ['support', 'help', 'ticket', 'agent'];
    const lowerBody = body.toLowerCase();
    const hasKeyword = keywords.some(kw => lowerBody.includes(kw));

    if (!hasKeyword) {
      logger.info(`[SupportInbox] Ignored WhatsApp message from ${senderPhone} (No keyword match)`);
      return;
    }

    // 3. Create new ticket
    // Optional: try to resolve a customer ID by phone
    const customerId = await this.resolveCustomerIdByPhone(senderPhone);
    const newTicket = await this.createNewTicket({
      subject: `WhatsApp Support: ${senderName || senderPhone}`,
      customer_name: senderName || 'Unknown WhatsApp User',
      customer_phone: senderPhone,
      source: 'whatsapp',
      user_id: customerId,
      description: body,
    });

    // 4. Append message
    await this.appendMessage(newTicket.id, 'whatsapp', 'inbound', body, senderName, null, senderPhone, raw_payload);
  }

  /**
   * Process inbound Email
   */
  async processInboundEmail(data: { raw_payload: any }) {
    const { raw_payload } = data;
    const emailPayload = raw_payload.data || raw_payload;
    const senderEmail = emailPayload.from;
    const subject = emailPayload.subject || 'No Subject';
    const body = emailPayload.text || emailPayload.html || '';

    // Match by email
    const activeTicket = await this.findActiveTicketByEmail(senderEmail);

    if (activeTicket) {
      await this.appendMessage(activeTicket.id, 'email', 'inbound', body, senderEmail, senderEmail, null, raw_payload);
      return;
    }

    // Create new ticket
    const customerId = await this.resolveCustomerIdByEmail(senderEmail);
    const newTicket = await this.createNewTicket({
      subject,
      customer_name: senderEmail,
      customer_email: senderEmail,
      source: 'email',
      user_id: customerId,
      description: body,
    });

    await this.appendMessage(newTicket.id, 'email', 'inbound', body, senderEmail, senderEmail, null, raw_payload);
  }

  // --- Helpers ---

  private async findActiveTicketByPhone(phone: string) {
    const supabase = await getAdminClient();
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_phone', phone)
      .in('status', ['new', 'open', 'assigned', 'in_progress', 'waiting_customer'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  }

  private async findActiveTicketByEmail(email: string) {
    const supabase = await getAdminClient();
    // Simplified regex extraction for emails like "Name <email@domain.com>"
    const cleanEmail = email.match(/<([^>]+)>/) ? email.match(/<([^>]+)>/)![1] : email;
    
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .ilike('customer_email', `%${cleanEmail}%`)
      .in('status', ['new', 'open', 'assigned', 'in_progress', 'waiting_customer'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  }

  private async resolveCustomerIdByPhone(phone: string) {
    const supabase = await getAdminClient();
    const { data } = await supabase.from('users').select('id').eq('phone', phone).single();
    return data?.id || null;
  }

  private async resolveCustomerIdByEmail(email: string) {
    const cleanEmail = email.match(/<([^>]+)>/) ? email.match(/<([^>]+)>/)![1] : email;
    const supabase = await getAdminClient();
    const { data } = await supabase.from('users').select('id').ilike('email', cleanEmail).single();
    return data?.id || null;
  }

  private async createNewTicket(payload: any) {
    const supabase = await getAdminClient();
    const priority = this.determinePriority(payload.subject);
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...payload,
        status: 'new',
        priority,
      })
      .select()
      .single();
      
    if (error) throw error;
    logger.info(`[SupportInbox] Created new ticket ${data.id}`);
    
    // Notify via socket
    try {
      SocketGateway.broadcastSystemAlert('new-ticket', `New ticket created: ${data.subject}`);
    } catch (err) {
      // ignore
    }
    
    return data;
  }

  private async appendMessage(ticketId: string, channel: string, direction: string, body: string, name: string, email: string | null, phone: string | null, raw: any) {
    const supabase = await getAdminClient();
    
    // Insert message
    const { error: msgErr } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        channel,
        direction,
        message_body: body,
        sender_name: name,
        sender_email: email,
        sender_phone: phone,
        raw_payload: raw
      });
      
    if (msgErr) {
       logger.error('[SupportInbox] Error appending message', msgErr);
       throw msgErr;
    }

    // Bump ticket updated_at
    await supabase.from('support_tickets').update({ updated_at: new Date().toISOString(), status: 'open' }).eq('id', ticketId);

    // Notify via socket
    try {
      SocketGateway.broadcastSystemAlert('new-message', `New message on ticket #${ticketId.substring(0,8)}`);
    } catch (err) {
      // ignore
    }
  }

  private determinePriority(text: string = ''): string {
    const lower = text.toLowerCase();
    if (lower.includes('refund') || lower.includes('payment failed') || lower.includes('urgent')) return 'high';
    if (lower.includes('technical') || lower.includes('error')) return 'medium';
    return 'low';
  }
}
