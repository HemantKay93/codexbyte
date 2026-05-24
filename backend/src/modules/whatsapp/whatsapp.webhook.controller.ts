import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../../services/logger.js';
import { WhatsAppRepository } from './whatsapp.repository.js';
import { CMSService } from '../cms/cms.service.js';

const repository = new WhatsAppRepository();

/**
 * GET /whatsapp/webhook/health
 * Called by the Admin Dashboard "Verify Webhook Connection" button.
 * Performs a live Meta Graph API handshake using credentials from DB.
 * Returns { success: true, connected: true/false, message, phoneInfo }
 */
export const webhookHealth = async (req: Request, res: Response) => {
  try {
    let settings;
    try {
      settings = await CMSService.getContent('global');
    } catch (e) {
      logger.warn('[WhatsApp Webhook] DB settings fetch failed in health check', e);
    }

    const waConfig = settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
    const token =
      waConfig.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
    const phoneId =
      waConfig.phoneNumberId ||
      process.env.WHATSAPP_PHONE_NUMBER_ID ||
      process.env.WHATSAPP_PHONE_ID;

    // --- No credentials at all ---
    if (!token || !phoneId) {
      return res.json({
        success: true,
        connected: false,
        message:
          'WhatsApp credentials (Access Token / Phone Number ID) are not configured in Settings.',
        phoneInfo: null,
      });
    }

    // --- Live Meta Graph API handshake ---
    try {
      const graphRes = await axios.get(`https://graph.facebook.com/v19.0/${phoneId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      if (graphRes.data && graphRes.data.id) {
        // Mark session as connected in DB
        await repository.updateSessionState('default', { status: 'connected' });

        return res.json({
          success: true,
          connected: true,
          message: 'Webhook is active and verified with Meta Graph API!',
          phoneInfo: {
            id: graphRes.data.id,
            displayPhoneNumber: graphRes.data.display_phone_number,
            verifiedName: graphRes.data.verified_name,
          },
        });
      }
    } catch (metaErr: any) {
      const metaError = metaErr?.response?.data?.error || metaErr.message;
      logger.error('[WhatsApp Webhook] Meta Graph API handshake failed:', metaError);

      // Mark as disconnected
      await repository.updateSessionState('default', { status: 'disconnected' }).catch(() => {});

      return res.json({
        success: true,
        connected: false,
        message: `Meta API Error: ${metaError?.message || JSON.stringify(metaError)}`,
        phoneInfo: null,
      });
    }

    // Fallback (should not reach here)
    return res.json({
      success: true,
      connected: false,
      message: 'Unexpected response from Meta Graph API.',
      phoneInfo: null,
    });
  } catch (error) {
    logger.error('[WhatsApp Webhook] Health check error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      message: 'Internal server error during health check',
    });
  }
};

/**
 * GET /whatsapp/webhook
 * Called by Meta to verify the webhook subscription.
 */
export const verifyWebhook = async (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Fetch expected token from global settings OR env fallback
    let expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    try {
      const settings = await CMSService.getContent('global');
      const waConfig =
        settings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
      if (waConfig.webhookVerifyToken) {
        expectedToken = waConfig.webhookVerifyToken;
      }
    } catch (e) {
      logger.warn('[WhatsApp Webhook] Could not fetch config from DB, falling back to ENV', e);
    }

    logger.info(
      `[WhatsApp Webhook] Verification attempt — mode: ${mode}, received token: ${token}, expected: ${expectedToken}`
    );

    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('[WhatsApp Webhook] Webhook verified successfully by Meta!');
      await repository.updateSessionState('default', { status: 'connected' });
      return res.status(200).send(challenge);
    } else {
      logger.warn(
        `[WhatsApp Webhook] Verification FAILED. Received: "${token}", Expected: "${expectedToken}"`
      );
      return res.sendStatus(403);
    }
  } catch (error) {
    logger.error('[WhatsApp Webhook] Verification error:', error);
    res.sendStatus(500);
  }
};

/**
 * POST /whatsapp/webhook
 * Receives incoming message events and delivery status updates from Meta.
 */
export const handleWebhookEvent = async (req: Request, res: Response) => {
  // Always respond 200 immediately — Meta requires this within 20 seconds
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      logger.warn('[WhatsApp Webhook] Received non-WhatsApp webhook event:', body.object);
      return;
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // --- Delivery status updates (sent/delivered/read/failed) ---
        if (value?.statuses) {
          for (const status of value.statuses) {
            const messageId = status.id;
            const deliveryStatus = status.status;

            logger.info(
              `[WhatsApp Webhook] Status update — Message ${messageId}: ${deliveryStatus}`
            );

            let mappedStatus: 'queued' | 'sent' | 'failed' | 'delivered' = 'sent';
            if (deliveryStatus === 'delivered' || deliveryStatus === 'read')
              mappedStatus = 'delivered';
            if (deliveryStatus === 'failed') mappedStatus = 'failed';

            const errorLog =
              deliveryStatus === 'failed'
                ? status.errors?.[0]?.title || 'Unknown error from Meta'
                : undefined;

            await repository.updateMessageStatusByExternalId(messageId, mappedStatus, errorLog);
          }
        }

        // --- Incoming messages (from customers) ---
        if (value?.messages) {
          for (const msg of value.messages) {
            logger.info(
              `[WhatsApp Webhook] Incoming message from ${msg.from}: ${msg.text?.body || '[media]'}`
            );
            // TODO: Route to support/chat module when ready
          }
        }
      }
    }

    // Keep session marked active
    await repository.updateSessionLastActive();
  } catch (error) {
    logger.error('[WhatsApp Webhook] Error processing webhook event:', error);
  }
};
