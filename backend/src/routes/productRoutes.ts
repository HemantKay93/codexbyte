import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.use(authenticate, authorize('admin', 'super-admin'));

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
