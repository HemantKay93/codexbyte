import { StateMachine } from './StateMachine.js';

export type OrderState =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type OrderEvent =
  | 'PAYMENT_RECEIVED'
  | 'BEGIN_PROCESSING'
  | 'SHIP_ORDER'
  | 'DELIVER_ORDER'
  | 'CANCEL_ORDER'
  | 'REFUND_ORDER';

export class OrderStateMachine extends StateMachine<OrderState, OrderEvent> {
  protected configure(): void {
    // pending
    this.addTransition('pending', 'PAYMENT_RECEIVED', 'paid');
    this.addTransition('pending', 'CANCEL_ORDER', 'cancelled');

    // paid
    this.addTransition('paid', 'BEGIN_PROCESSING', 'processing');
    this.addTransition('paid', 'REFUND_ORDER', 'refunded');

    // processing
    this.addTransition('processing', 'SHIP_ORDER', 'shipped');
    this.addTransition('processing', 'REFUND_ORDER', 'refunded');

    // shipped
    this.addTransition('shipped', 'DELIVER_ORDER', 'delivered');
    this.addTransition('shipped', 'REFUND_ORDER', 'refunded');

    // delivered, cancelled, refunded are terminal states (mostly)
    this.addTransition('delivered', 'REFUND_ORDER', 'refunded');
  }
}
