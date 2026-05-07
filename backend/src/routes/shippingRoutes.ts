import express from 'express';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();

router.get('/rates', shippingController.getShippingRates);
router.get('/track/:trackingId', shippingController.trackShipment);

export default router;
