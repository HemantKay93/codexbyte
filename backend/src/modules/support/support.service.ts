import { SupportRepository } from './support.repository.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import { EmailService } from '../../services/email.js';

const supportRepo = new SupportRepository();

export class SupportService {
  static async replyToTicket(ticketId: string, messageBody: string, senderName: string, senderEmail: string) {
    const ticket = await supportRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const channel = ticket.source || 'portal';
    
    // 1. Save to DB
    const message = await supportRepo.replyToTicket(ticketId, messageBody, senderName, senderEmail, channel);

    // 2. Dispatch externally if needed
    try {
      if (channel === 'whatsapp' && ticket.customer_phone) {
        await WhatsAppService.enqueueMessage(ticket.customer_phone, {
           type: 'text',
           content: messageBody
        }, 10);
      } else if (channel === 'email' && ticket.customer_email) {
        await EmailService.sendEmail(
           ticket.customer_email,
           `Re: ${ticket.subject}`,
           messageBody
        );
      }
    } catch (err) {
      console.error('[SupportService] Failed to dispatch outbound reply', err);
    }

    return message;
  }
}
