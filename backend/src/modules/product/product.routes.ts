import express from 'express';

import { authenticate, authorize } from '../../middlewares/auth.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';

import * as productController from './product.controller.js';
import { productSchema, productUpdateSchema } from './product.validator.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.use(authenticate);

router.post(
  '/',
  requirePermission('products:write'),
  validate(productSchema),
  productController.createProduct
);
router.put(
  '/:id',
  requirePermission('products:write'),
  validate(productUpdateSchema),
  productController.updateProduct
);
router.delete('/:id', requirePermission('products:delete'), productController.deleteProduct);

export default router;
