export enum DomainEvents {
  // User/Customer Events
  USER_REGISTERED = 'user.registered',
  CUSTOMER_INACTIVE = 'customer.inactive',

  // Order/Cart Events
  ORDER_CREATED = 'order.created',
  ORDER_COMPLETED = 'order.completed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_STATUS_UPDATED = 'order.status_updated',
  CART_ABANDONED = 'cart.abandoned',

  // Payment Events
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_SUCCEEDED = 'payment.succeeded',

  // Review Events
  REVIEW_PENDING = 'review.pending',
  REVIEW_SUBMITTED = 'review.submitted',

  // Marketing Events
  CAMPAIGN_CREATED = 'campaign.created',
  CAMPAIGN_COMPLETED = 'campaign.completed',
  CAMPAIGN_PAUSED = 'campaign.paused',
}

export interface DomainEventPayload {
  [DomainEvents.USER_REGISTERED]: { userId: string; email: string; name: string };
  [DomainEvents.CUSTOMER_INACTIVE]: { customerId: string; lastActiveAt: Date };

  [DomainEvents.ORDER_CREATED]: {
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    email?: string;
    phone?: string;
    totalAmount: number;
  };
  [DomainEvents.ORDER_COMPLETED]: { orderId: string; customerId: string };
  [DomainEvents.ORDER_CANCELLED]: { orderId: string; reason: string };
  [DomainEvents.ORDER_STATUS_UPDATED]: {
    orderId: string;
    orderNumber: string;
    status: string;
    customerId: string;
    notes?: string;
    phone?: string;
    email?: string;
  };
  [DomainEvents.CART_ABANDONED]: { cartId: string; customerId: string; items: any[] };
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-explicit-any

  [DomainEvents.PAYMENT_FAILED]: { orderId: string; amount: number; reason: string };
  [DomainEvents.PAYMENT_SUCCEEDED]: { orderId: string; transactionId: string };

  [DomainEvents.REVIEW_PENDING]: { orderId: string; customerId: string; productId: string };
  [DomainEvents.REVIEW_SUBMITTED]: { reviewId: string; rating: number };

  [DomainEvents.CAMPAIGN_CREATED]: { campaignId: string; name: string; type: string };
  [DomainEvents.CAMPAIGN_COMPLETED]: {
    campaignId: string;
    successCount: number;
    failCount: number;
  };
  [DomainEvents.CAMPAIGN_PAUSED]: { campaignId: string };
}
