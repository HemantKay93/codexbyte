import express, { Request, Response } from 'express';
import * as adminController from './admin.controller.js';
import * as orderController from '../order/order.controller.js';
import * as productController from '../product/product.controller.js';
import * as reviewController from '../review/review.controller.js';
import * as cmsController from '../cms/cms.controller.js';
import * as warehouseController from '../inventory/inventory.controller.js';
import * as reportController from './report.controller.js';
import * as dlqController from './dlq.controller.js';
import * as returnController from '../order/return.controller.js';

import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { catchAsync } from '../../middlewares/error.js';
import { idempotencyMiddleware } from '../../middlewares/idempotency.middleware.js';
import { productSchema, productUpdateSchema } from '../product/product.validator.js';

const router = express.Router();

router.use(authenticate, authorize('admin', 'super-admin'));

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// Analytics
router.get('/sales-report', adminController.getSalesReport);

// Orders
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/:id/activity', adminController.getOrderActivity);
router.put('/orders/:id', orderController.updateOrder);
router.post('/orders/:id/return', idempotencyMiddleware, orderController.processReturn);

// Returns (RMA)
router.get('/returns', returnController.getReturns);
router.put('/returns/:id', returnController.updateReturnStatus);
router.post('/returns', returnController.createReturnRequest);

// Products
router.get('/products', productController.getProducts);
router.post('/products/bulk-import', productController.bulkImportProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', validate(productSchema), productController.createProduct);
router.put('/products/:id', validate(productUpdateSchema), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Customers
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetail);

// Warehouse — static routes MUST come before dynamic /:id routes
router.get('/warehouse', adminController.getWarehouses);
router.post('/warehouse', adminController.createWarehouse);
router.get('/warehouse/tasks', adminController.getWarehouseTasks); // static: before /:id
router.post('/warehouse/adjust-stock', warehouseController.adjustStock); // static: before /:id
router.post('/warehouse/transfer-stock', warehouseController.transferStock); // static: before /:id
router.post('/warehouse/tasks/pick', warehouseController.markTaskPicked); // static: before /:id
router.get('/warehouse/movements/:productId', warehouseController.getStockMovements);
router.get('/warehouse/:id/inventory', warehouseController.getWarehouseInventory);
router.put('/warehouse/:id', adminController.updateWarehouse);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

// Reviews
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id', reviewController.updateReviewStatus);

// CMS
router.put('/cms/:pageSlug/:sectionKey', cmsController.updateCmsContent);

// Reports
router.get('/reports/invoice/:id', reportController.exportInvoice);

// Audit
router.get('/audit-logs', adminController.getAuditLogs);

// Upload
router.post('/upload', adminController.uploadFile);

// Team Management
router.get('/team', adminController.getTeamMembers);
router.post('/team/invite', adminController.inviteTeamMember);
router.put('/team/:id/role', adminController.updateTeamMemberRole);

// DLQ Endpoints
router.get('/dlq', authorize('admin', 'super-admin'), dlqController.getDeadLetters);
router.post('/dlq/:id/retry', authorize('admin', 'super-admin'), dlqController.retryDeadLetter);
router.put('/dlq/:id/resolve', authorize('admin', 'super-admin'), dlqController.resolveDeadLetter);

export default router;
