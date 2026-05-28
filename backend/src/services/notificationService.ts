import { getAdminClient } from '../config/supabase.js';

import logger from './logger.js';

export class NotificationService {
  static async send(data: {
    userId?: string; // If empty, consider it a system-wide admin notification
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    logger.info(`Notification [${data.type}]: ${data.title} - ${data.message}`);

    try {
      const admin = await getAdminClient();
      await admin.from('notifications').insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'medium',
        metadata: data.metadata,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      // Real-time broadcast (via Supabase Realtime or Socket.io)
      // This is handled automatically by Supabase if the client subscribes to 'notifications'
    } catch (err) {
      logger.error('Failed to persist notification:', err);
    }
  }

  static async notifyLowStock(productName: string, warehouseName: string, currentStock: number) {
    await this.send({
      title: 'Low Stock Alert',
      message: `${productName} in ${warehouseName} is running low (${currentStock} left).`,
      type: 'warning',
      priority: 'high',
      metadata: { module: 'inventory', warehouse: warehouseName },
    });
  }

  static async notifyOrderEvent(orderNumber: string, status: string, notes?: string) {
    const isCritical = ['cancelled', 'returned'].includes(status);
    await this.send({
      title: `Order ${status.toUpperCase()}`,
      message: `Order #${orderNumber} has been ${status}.${notes ? ` Note: ${notes}` : ''}`,
      type: isCritical ? 'error' : 'info',
      priority: isCritical ? 'high' : 'medium',
      metadata: { module: 'orders', orderNumber },
    });
  }
}
