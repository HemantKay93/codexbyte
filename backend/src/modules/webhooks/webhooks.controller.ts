import { Request, Response } from 'express';

import { WebhooksService } from './webhooks.service.js';

const webhooksService = new WebhooksService();

export const handleResendWebhook = async (req: Request, res: Response) => {
  // Can verify Resend signature here via req.headers['svix-signature']
  await webhooksService.handleEvent(req.body, 'resend');
  res.status(200).send('OK');
};

export const handleBrevoWebhook = async (req: Request, res: Response) => {
  await webhooksService.handleEvent(req.body, 'brevo');
  res.status(200).send('OK');
};

export const handleMetaWhatsAppWebhook = async (req: Request, res: Response) => {
  // Hub Challenge for Meta Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send('Forbidden');
      return;
    }
  }

  // Handle Event
  await webhooksService.handleEvent(req.body, 'meta-whatsapp');
  res.status(200).send('OK');
};
