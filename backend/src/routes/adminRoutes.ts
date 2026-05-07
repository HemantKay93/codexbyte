import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as orderController from '../controllers/orderController.js';
import * as productController from '../controllers/productController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as cmsController from '../controllers/cmsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate, authorize('admin', 'super-admin'));

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// Orders
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/:id/activity', adminController.getOrderActivity);
router.put('/orders/:id', orderController.updateOrder);

// Products
router.get('/products', productController.getProducts);
router.post('/products/bulk-import', productController.bulkImportProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Customers
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetail);

// Warehouse
router.get('/warehouse', adminController.getWarehouses);
router.post('/warehouse', adminController.createWarehouse);
router.put('/warehouse/:id', adminController.updateWarehouse);
router.get('/warehouse/tasks', adminController.getWarehouseTasks);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

// Reviews
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id', reviewController.updateReviewStatus);

// CMS
router.put('/cms/:pageSlug/:sectionKey', cmsController.updateCmsContent);

// Upload
router.post('/upload', (req, res) => {
  // Placeholder: In a real system, this would upload to S3/Cloudinary/Supabase
  // For now, return a reliable placeholder or the provided URL if it's already a URL
  res.json({ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' });
});

export default router;
