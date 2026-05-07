import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/error.js';
import axios from 'axios';

export const getShippingRates = catchAsync(async (req: Request, res: Response) => {
  // Check if credentials exist
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    return res.json({
      rates: [
        { courier_name: 'Delhivery', rate: 40, estimated_delivery_days: 3 },
        { courier_name: 'BlueDart', rate: 90, estimated_delivery_days: 2 },
      ]
    });
  }

  const tokenResponse = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  const ratesResponse = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
    {
      params: req.query,
      headers: {
        Authorization: `Bearer ${tokenResponse.data.token}`,
      },
    }
  );

  res.json(ratesResponse.data);
});

export const trackShipment = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  
  if (!process.env.SHIPROCKET_EMAIL) {
    return res.json({
      trackingId,
      status: 'In Transit',
      events: [{ status: 'Shipment Created', timestamp: new Date().toISOString() }]
    });
  }

  // Similar logic to get token and track
  res.json({ trackingId, status: 'Processing' });
});
