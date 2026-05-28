import { JobService } from '../services/jobService.js';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service.js';
import logger from '../services/logger.js';

export class NotificationWorkflow {
  /**
   * Orchestrates multi-channel notifications (In-app, Email, WhatsApp)
   */
  static async notifyCustomerOrderUpdate(data: {
    orderNumber: string;
    status: string;
    notes?: string;
    phone?: string;
    email?: string;
    userId?: string;
  }) {
    const { status, orderNumber, notes, phone, email, userId } = data;
    const isCritical = ['cancelled', 'returned'].includes(status);

    // 1. In-App Notification (Admin/System)
    try {
      await JobService.sendNotification({
        title: `Order ${status.toUpperCase()}`,
        message: `Order #${orderNumber} has been ${status}.${notes ? ` Note: ${notes}` : ''}`,
        type: isCritical ? 'error' : 'info',
        priority: isCritical ? 'high' : 'medium',
        metadata: { module: 'orders', orderNumber },
        userId,
      });
    } catch (err) {
      logger.error('[NotificationWorkflow] Failed to send in-app notification:', err);
    }

    // 2. WhatsApp Notification (Customer)
    if (phone) {
      try {
        let content = `Update on Order #${orderNumber}: Your order status has been updated to *${status.toUpperCase()}*.`;
        if (notes) content += `\nNote: ${notes}`;
        if (!isCritical && ['shipped', 'delivered'].includes(status)) {
          content = `Great news! Your order #${orderNumber} is now *${status.toUpperCase()}*.`;
        }

        await WhatsAppService.enqueueMessage(phone, {
          content,
          type: 'text',
        });
      } catch (waErr) {
        logger.error('[NotificationWorkflow] Failed to send WhatsApp notification:', waErr);
      }
    }

    // 3. Email Notification (Customer) - Example for shipped/cancelled
    if (email && ['shipped', 'cancelled', 'refunded'].includes(status)) {
      try {
        await JobService.sendEmail(
          email,
          `Order ${status.toUpperCase()}: #${orderNumber}`,
          `<h1>Your order has been ${status}</h1><p>${notes || ''}</p>`
        );
      } catch (emailErr) {
        logger.error('[NotificationWorkflow] Failed to send Email notification:', emailErr);
      }
    }
  }

  static async notifyNewOrder(data: {
    orderNumber: string;
    customerName: string;
    phone?: string;
    email?: string;
  }) {
    // Email
    if (data.email) {
      await JobService.sendEmail(
        data.email,
        `Order Confirmed: ${data.orderNumber}`,
        `<h1>Thank you for your order, ${data.customerName}!</h1><p>Your order #${data.orderNumber} is being processed.</p>`
      ).catch((e) => logger.error('Failed to send new order email:', e));
    }

    // WhatsApp
    if (data.phone) {
      await WhatsAppService.enqueueMessage(data.phone, {
        content: `Hi ${data.customerName},\n\nYour order #${data.orderNumber} has been successfully placed! We will notify you once it ships.`,
        type: 'text',
      }).catch((e) => logger.error('Failed to send new order WhatsApp:', e));
    }
  }
}
