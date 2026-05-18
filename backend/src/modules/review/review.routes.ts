import express from 'express';
import * as reviewController from './review.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', authenticate, reviewController.createReview);

// Admin routes
router.get('/admin', authenticate, authorize('admin', 'super-admin'), reviewController.getAllReviews);
router.put('/admin/:id', authenticate, authorize('admin', 'super-admin'), reviewController.updateReviewStatus);

export default router;
