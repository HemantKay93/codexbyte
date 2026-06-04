import { Express } from 'express';

import { authenticate, authorize } from '../middlewares/auth.js';
import * as reportController from '../modules/admin/report.controller.js';
import productRoutes from '../modules/product/product.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import reviewRoutes from '../modules/review/review.routes.js';
import cmsRoutes from '../modules/cms/cms.routes.js';
import webhookRoutes from '../modules/webhooks/webhooks.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';
import shippingRoutes from '../modules/shipping/shipping.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import posRoutes from '../modules/pos/pos.routes.js';
import marketingRoutes from '../modules/marketing/marketing.routes.js';
import { accountingRoutes } from '../modules/accounting/accounting.routes.js';
import leadRoutes from '../modules/lead/lead.routes.js';
import supportRoutes from '../modules/support/support.routes.js';
import supplierRoutes from '../modules/supplier/supplier.routes.js';
import whatsappRoutes from '../modules/whatsapp/whatsapp.routes.js';
import { crmRoutes } from '../modules/crm/crm.routes.js';
import { approvalsRoutes } from '../modules/approvals/approvals.routes.js';
import { documentsRoutes } from '../modules/documents/documents.routes.js';
import { workflowsRoutes } from '../modules/workflows/workflows.routes.js';
import { slaRoutes } from '../modules/sla/sla.routes.js';
import { operationsRoutes } from '../modules/operations/operations.routes.js';
import reportingRoutes from '../modules/reporting/reporting.routes.js';

import { createRateLimiters } from './middleware.js';

export function bootstrapRoutes(app: Express) {
  const { generalLimiter, authLimiter, webhookLimiter } = createRateLimiters();

  // Mount Routes with Specific Rate Limits
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/webhooks', webhookLimiter, webhookRoutes);

  app.use('/api/v1/accounting', generalLimiter, accountingRoutes);
  app.use('/api/v1/products', generalLimiter, productRoutes);
  app.use('/api/v1/orders', generalLimiter, orderRoutes);
  app.use('/api/v1/admin', generalLimiter, adminRoutes);
  app.use('/api/v1/reviews', generalLimiter, reviewRoutes);
  app.use('/api/v1/cms', generalLimiter, cmsRoutes);
  app.use('/api/v1/wishlist', generalLimiter, wishlistRoutes);
  app.use('/api/v1/payments', generalLimiter, paymentRoutes);
  app.use('/api/v1/shipping', generalLimiter, shippingRoutes);
  app.use('/api/v1/warehouse', inventoryRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/pos', posRoutes);
  app.use('/api/v1/marketing', marketingRoutes);
  app.use('/api/v1/leads', leadRoutes);
  app.use('/api/v1/support', supportRoutes);
  app.use('/api/v1/suppliers', supplierRoutes);
  app.use('/api/v1/whatsapp', whatsappRoutes);
  app.use('/api/v1/crm', crmRoutes);
  app.use('/api/v1/approvals', approvalsRoutes);
  app.use('/api/v1/documents', documentsRoutes);
  app.use('/api/v1/workflows', workflowsRoutes);
  app.use('/api/v1/sla', slaRoutes);
  app.use('/api/v1/operations', operationsRoutes);
  app.use('/api/v1/reporting', reportingRoutes);

  // Legacy compatibility
  app.use('/api/leads', leadRoutes);

  app.get(
    '/api/v1/reports/export',
    authenticate,
    authorize('admin', 'super-admin'),
    reportController.exportReport
  );

  // Health Check
  app.get(['/health', '/api/health'], (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
