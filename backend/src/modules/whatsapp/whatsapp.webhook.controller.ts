import { Request, Response } from 'express';
import logger from '../../services/logger.js';
import { WhatsAppRepository } from './whatsapp.repository.js';
import { CMSService } from '../cms/cms.service.js';

const repository = new WhatsAppRepository();

export const webhookHealth = async (req: Request, res: Response) => {
  try {
    // In a real scenario, you'd check if any messages were updated recently via webhook
    res.json({ success: true, message: 'Webhook endpoint is active' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check webhook health' });
  }
};

export const verifyWebhook = async (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Fetch expected token from global settings OR environment variable fallback
    const settings = await CMSService.getContent('global');
    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
    const expectedToken = waConfig.webhookVerifyToken || process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('[WhatsApp Webhook] Webhook verified successfully!');
      return res.status(200).send(challenge);
    } else {
      logger.warn('[WhatsApp Webhook] Webhook verification failed. Token mismatch.');
      return res.sendStatus(403);
    }
  } catch (error) {
    logger.error('[WhatsApp Webhook] Verification error:', error);
    res.sendStatus(500);
  }
};

export const handleWebhookEvent = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Check if it's a WhatsApp status update
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.statuses) {
            for (const status of change.value.statuses) {
              const messageId = status.id;
              const deliveryStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

              logger.info(
                `[WhatsApp Webhook] Message ${messageId} status updated to ${deliveryStatus}`
              );

              // Map Cloud API statuses to our DB statuses
              let mappedStatus: 'queued' | 'sent' | 'failed' | 'delivered' = 'sent';
              if (deliveryStatus === 'delivered' || deliveryStatus === 'read')
                mappedStatus = 'delivered';
              if (deliveryStatus === 'failed') mappedStatus = 'failed';

              // Update the repository based on the external messageId
              await repository.updateMessageStatusByExternalId(messageId, mappedStatus);
            }
          }
        }
      }

      // Update session last active to keep dashboard connection status green
      await repository.updateSessionLastActive();

      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    logger.error('[WhatsApp Webhook] Error handling event:', error);
    res.sendStatus(500);
  }
};
