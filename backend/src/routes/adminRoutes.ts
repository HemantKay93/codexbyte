import express, { Request, Response } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as orderController from '../controllers/orderController.js';
import * as productController from '../controllers/productController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as cmsController from '../controllers/cmsController.js';
import * as warehouseController from '../controllers/warehouseController.js';
import * as reportController from '../controllers/reportController.js';
import * as returnController from '../controllers/returnController.js';

import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { catchAsync } from '../middlewares/error.js';
import { productSchema, productUpdateSchema } from '../validators/productValidator.js';

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
router.post('/orders/:id/return', orderController.processReturn);

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
router.post('/warehouse/tasks/pick', warehouseController.markTaskPicked); // static: before /:id
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
router.get(
  '/audit-logs',
  catchAsync(async (req: Request, res: Response) => {
    const { getAdminClient } = await import('../config/supabase.js');
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('audit_logs')
      .select('*, user_profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data);
  })
);

// Upload

router.post('/upload', (req, res) => {
  // Placeholder: In a real system, this would upload to S3/Cloudinary/Supabase
  // For now, return a reliable placeholder or the provided URL if it's already a URL
  res.json({ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' });
});

export default router;
