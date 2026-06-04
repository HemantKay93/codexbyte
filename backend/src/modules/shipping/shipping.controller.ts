import { Request, Response } from 'express';
import axios from 'axios';

import { catchAsync } from '../../middlewares/error.js';
import logger from '../../services/logger.js';

import { ShiprocketProvider } from './providers/shiprocket.provider.js';
import { ShipmentService } from './shipping.service.js';

const getProvider = () => {
  return new ShiprocketProvider(
    process.env.SHIPROCKET_EMAIL || 'admin@codexbyte.com',
    process.env.SHIPROCKET_PASSWORD || 'secret'
  );
};

export const getShippingRates = catchAsync(async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    const token = await provider['authenticate'](); // Use internal or public method if needed

    // Call the external API for rates
    const ratesResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
      {
        params: req.query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.json(ratesResponse.data);
  } catch (err: any) {
    logger.error(`Shiprocket API failed: ${err.message}`);
    return res.status(503).json({ error: 'Failed to fetch shipping rates' });
  }
});

export const trackShipment = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  try {
    const provider = getProvider();
    const status = await provider.trackShipment(String(trackingId));

    if (!status) {
      return res.status(404).json({ error: 'Tracking info not found' });
    }

    res.json({ trackingId, status });
  } catch (err: any) {
    logger.error(`Failed to track shipment: ${err.message}`);
    res.status(500).json({ error: 'Failed to retrieve tracking info' });
  }
});

export const webhookHandler = catchAsync(async (req: Request, res: Response) => {
  // Validate webhook signature if applicable
  await ShipmentService.handleWebhook(req.body);
  res.status(200).send('OK');
});
