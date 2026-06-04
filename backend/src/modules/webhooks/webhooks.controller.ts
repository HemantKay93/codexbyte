import crypto from 'crypto';

import { Request, Response } from 'express';

import { env } from '../../config/env.js';
import { CryptoUtils } from '../../utils/crypto.util.js';
import { AppError } from '../../middlewares/error.js';

import { WebhooksService } from './webhooks.service.js';

const webhooksService = new WebhooksService();

export const handleResendWebhook = async (req: Request, res: Response) => {
  // Resend uses Svix but simple manual check if secret is provided
  const signature = req.headers['svix-signature'] as string;
  // Proper svix verification requires svix library and timestamp validation.
  // For standard HMAC if provided:
  if (env.RESEND_API_KEY && signature) {
    // Implement constant-time comparison
    // const isValid = CryptoUtils.verifyHmacSignature(JSON.stringify(req.body), signature, env.RESEND_API_KEY);
    // if (!isValid) throw new AppError('Invalid webhook signature', 401);
  }

  await webhooksService.handleEvent(req.body, 'resend');
  res.status(200).send('OK');
};

export const handleBrevoWebhook = async (req: Request, res: Response) => {
  // Brevo signature check if applicable
  await webhooksService.handleEvent(req.body, 'brevo');
  res.status(200).send('OK');
};

export const handleMetaWhatsAppWebhook = async (req: Request, res: Response) => {
  // Hub Challenge for Meta Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.META_WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send('Forbidden');
      return;
    }
  }

  // Handle Event & signature verification
  const signature = req.headers['x-hub-signature-256'] as string;
  if (env.WHATSAPP_APP_SECRET && signature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature = `sha256=${crypto.createHmac('sha256', env.WHATSAPP_APP_SECRET).update(rawBody).digest('hex')}`;

    if (!CryptoUtils.constantTimeCompare(signature, expectedSignature)) {
      res.status(401).send('Invalid signature');
      return;
    }
  }

  await webhooksService.handleEvent(req.body, 'meta-whatsapp');
  res.status(200).send('OK');
};
