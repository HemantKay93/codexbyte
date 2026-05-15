import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/permission.js';

const router = express.Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/addresses', authenticate, userController.getAddresses);
router.post('/addresses', authenticate, userController.addAddress);
router.put('/addresses/:id', authenticate, userController.updateAddress);
router.delete('/addresses/:id', authenticate, userController.deleteAddress);

// Admin routes
router.get('/admin/all', authenticate, requirePermission('users:read'), userController.getAllUsers);
router.post(
  '/admin/:id/block',
  authenticate,
  requirePermission('users:write'),
  userController.blockUser
);
router.post(
  '/admin/:id/unblock',
  authenticate,
  requirePermission('users:write'),
  userController.unblockUser
);

export default router;
