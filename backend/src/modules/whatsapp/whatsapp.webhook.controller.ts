import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../../services/logger.js';
import { WhatsAppRepository } from './whatsapp.repository.js';
import { CMSService } from '../cms/cms.service.js';
import { getAdminClient } from '../../config/supabase.js';

const repository = new WhatsAppRepository();

/**
 * GET /whatsapp/webhook/health
 * Checks connection for the PRIMARY provider configured.
 */
export const webhookHealth = async (req: Request, res: Response) => {
  try {
    const admin = await getAdminClient();
    const { data: configs } = await admin
      .from('provider_configs')
      .select('*')
      .eq('is_enabled', true)
      .order('priority', { ascending: true })
      .limit(1);

    const primaryConfig = configs?.[0];

    if (!primaryConfig) {
      return res.json({
        success: true,
        connected: false,
        message: 'No enabled WhatsApp providers found in configuration.',
      });
    }

    // Health check logic based on provider type
    if (primaryConfig.provider_name === 'meta') {
      const token = primaryConfig.config.accessToken;
      const phoneId = primaryConfig.config.phoneNumberId;

      if (!token || !phoneId) {
        return res.json({ success: true, connected: false, message: 'Missing Meta credentials.' });
      }

      try {
        const graphRes = await axios.get(`https://graph.facebook.com/v19.0/${phoneId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        });
        return res.json({
          success: true,
          connected: true,
          message: 'Meta Webhook is active and verified!',
          provider: 'meta',
        });
      } catch (err: any) {
        return res.json({ success: true, connected: false, message: `Meta Error: ${err.message}` });
      }
    } else if (primaryConfig.provider_name === 'evolution') {
      const { baseUrl, apiKey, instanceName } = primaryConfig.config;
      if (!baseUrl || !apiKey || !instanceName) {
        return res.json({
          success: true,
          connected: false,
          message: 'Missing Evolution credentials.',
        });
      }
      try {
        const url = `${baseUrl}/instance/connectionState/${instanceName}`;
        const evoRes = await axios.get(url, { headers: { apikey: apiKey }, timeout: 8000 });
        const connected = evoRes.data?.instance?.state === 'open';
        return res.json({
          success: true,
          connected,
          message: connected ? 'Evolution instance is connected!' : 'Evolution instance is closed.',
          provider: 'evolution',
        });
      } catch (err: any) {
        return res.json({
          success: true,
          connected: false,
          message: `Evolution Error: ${err.message}`,
        });
      }
    }

    return res.json({ success: true, connected: false, message: 'Unknown provider type.' });
  } catch (error) {
    logger.error('[WhatsApp Webhook] Health check error:', error);
    res.status(500).json({ success: false, connected: false, message: 'Internal server error' });
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

    let expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const admin = await getAdminClient();
    const { data: metaConfig } = await admin
      .from('provider_configs')
      .select('config')
      .eq('provider_name', 'meta')
      .single();
    if (metaConfig?.config?.webhookVerifyToken) {
      expectedToken = metaConfig.config.webhookVerifyToken;
    }

    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('[WhatsApp Webhook] Webhook verified successfully by Meta!');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

/**
 * POST /whatsapp/webhook
 * Receives unified incoming message events and delivery status updates.
 */
export const handleWebhookEvent = async (req: Request, res: Response) => {
  res.sendStatus(200); // Respond immediately

  try {
    const body = req.body;
    const admin = await getAdminClient();

    // 1. Check if Meta Cloud API Payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Process Meta Delivery Status
          if (value?.statuses) {
            for (const status of value.statuses) {
              await normalizeAndSaveEvent(admin, {
                provider: 'meta',
                message_id: status.id,
                status: mapMetaStatus(status.status),
                recipient: status.recipient_id,
                metadata: status,
              });
            }
          }

          // Incoming Meta Messages
          if (value?.messages) {
            for (const msg of value.messages) {
              logger.info(`[WhatsApp Webhook] Incoming Meta message from ${msg.from}`);
            }
          }
        }
      }
    }
    // 2. Check if Evolution API Payload (typical evolution webhook structure)
    else if (body.event) {
      // Process Evolution Delivery Status
      if (body.event === 'messages.update' && body.data) {
        const msg = body.data;
        await normalizeAndSaveEvent(admin, {
          provider: 'evolution',
          message_id: msg.key.id,
          status: mapEvolutionStatus(msg.status),
          recipient: msg.key.remoteJid?.split('@')[0] || 'unknown',
          metadata: msg,
        });
      }

      // Incoming Evolution Messages
      if (body.event === 'messages.upsert') {
        logger.info(`[WhatsApp Webhook] Incoming Evolution message`);
      }
    }
    // 3. Fallback OpenWA logic could go here if needed
  } catch (error) {
    logger.error('[WhatsApp Webhook] Error processing webhook event:', error);
  }
};

async function normalizeAndSaveEvent(admin: any, event: any) {
  try {
    logger.info(
      `[Webhook] Normalizing event: ${event.provider} - ${event.message_id} -> ${event.status}`
    );

    // 1. Insert into unified delivery_events table
    await admin.from('delivery_events').insert(event);

    // 2. Update legacy whatsapp_messages table for backwards compatibility
    const errorLog = event.status === 'failed' ? JSON.stringify(event.metadata) : undefined;
    await repository.updateMessageStatusByExternalId(event.message_id, event.status, errorLog);
  } catch (err) {
    logger.error('[Webhook] Failed to save normalized event', err);
  }
}

function mapMetaStatus(metaStatus: string): string {
  if (metaStatus === 'read' || metaStatus === 'delivered') return 'delivered';
  if (metaStatus === 'failed') return 'failed';
  return 'sent'; // 'sent' or 'queued'
}

function mapEvolutionStatus(evoStatus: string | number): string {
  // Evolution uses numerical statuses internally sometimes, or strings depending on version.
  // 1=PENDING, 2=SERVER_ACK, 3=DELIVERY_ACK, 4=READ, 5=PLAYED
  const s = String(evoStatus).toUpperCase();
  if (s === '3' || s === '4' || s === 'DELIVERY_ACK' || s === 'READ') return 'delivered';
  if (s === 'ERROR' || s === 'FAILED') return 'failed';
  return 'sent';
}
