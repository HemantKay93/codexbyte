import express from 'express';
import * as wishlistController from './wishlist.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/:productId/toggle', wishlistController.toggleWishlist);
router.get('/:productId/check', wishlistController.checkWishlist);

export default router;
