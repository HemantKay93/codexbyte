import { eventBus } from './EventBus.js';
import { DomainEvents } from './events.js';
import { NotificationWorkflow } from '../../workflows/notificationWorkflow.service.js';
import logger from '../../services/logger.js';
import { AutomationEngine } from '../automation/AutomationEngine.js';

export function initializeEventSubscribers() {
  logger.info('[EventSubscriber] Initializing domain event listeners...');

  // ----------------------------------------------------
  // ORDER EVENTS
  // ----------------------------------------------------
  
  eventBus.subscribe(DomainEvents.ORDER_CREATED, async (payload) => {
    logger.info(`[EventSubscriber] Handling ORDER_CREATED for ${payload.orderId}`);
    
    // Trigger notification workflow (which queues emails/whatsapp internally)
    await NotificationWorkflow.notifyNewOrder({
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      phone: payload.phone,
      email: payload.email
    });

    // Trigger Automation Engine
    await AutomationEngine.evaluateTrigger('order_created', payload);
  });

  eventBus.subscribe(DomainEvents.ORDER_STATUS_UPDATED, async (payload) => {
    logger.info(`[EventSubscriber] Handling ORDER_STATUS_UPDATED for ${payload.orderId} to ${payload.status}`);
    
    await NotificationWorkflow.notifyCustomerOrderUpdate({
      orderNumber: payload.orderNumber,
      status: payload.status,
      notes: payload.notes,
      phone: payload.phone,
      email: payload.email,
      userId: payload.customerId !== 'guest' ? payload.customerId : undefined
    });
  });

  eventBus.subscribe(DomainEvents.ORDER_COMPLETED, async (payload) => {
    logger.info(`[EventSubscriber] Handling ORDER_COMPLETED for ${payload.orderId}`);
    await AutomationEngine.evaluateTrigger('order_completed', payload);
  });

  eventBus.subscribe(DomainEvents.ORDER_CANCELLED, async (payload) => {
    logger.info(`[EventSubscriber] Handling ORDER_CANCELLED for ${payload.orderId}. Reason: ${payload.reason}`);
    await AutomationEngine.evaluateTrigger('order_cancelled', payload);
  });
  
  eventBus.subscribe(DomainEvents.USER_REGISTERED, async (payload) => {
    logger.info(`[EventSubscriber] Handling USER_REGISTERED for ${payload.userId}`);
    await AutomationEngine.evaluateTrigger('user_registered', payload);
  });
  
  eventBus.subscribe(DomainEvents.CART_ABANDONED, async (payload) => {
    logger.info(`[EventSubscriber] Handling CART_ABANDONED for cart ${payload.cartId}`);
    await AutomationEngine.evaluateTrigger('cart_abandoned', payload);
  });
}
