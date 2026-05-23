import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import logger from '../logger.js';
import { WhatsAppRepository } from '../../modules/whatsapp/whatsapp.repository.js';
import { WhatsAppMessagePayload } from '../../modules/whatsapp/whatsapp.types.js';

export class WhatsAppWorkerService {
  private client: any = null;
  private repository: WhatsAppRepository;
  private isInitializing: boolean = false;

  constructor() {
    this.repository = new WhatsAppRepository();
  }

  async initialize() {
    if (this.client || this.isInitializing) return;
    this.isInitializing = true;

    try {
      logger.info('[WhatsAppWorker] Initializing session via whatsapp-web.js...');
      await this.repository.updateSessionState('default', { status: 'authenticating', qr_code: '' });

      this.client = new Client({
        authStrategy: new LocalAuth({ clientId: "byteevolvr-session" }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.client.on('qr', async (qrStr: string) => {
        logger.info(`[WhatsAppWorker] QR Code received. Scan it in Admin UI or terminal!`);
        qrcodeTerminal.generate(qrStr, { small: true }); 
        
        try {
            // Save raw string to avoid Base64 column length limits in Supabase
            await this.repository.updateSessionState('default', { status: 'qr_ready', qr_code: qrStr });
        } catch (err) {
            logger.error('[WhatsAppWorker] Failed to save QR to DB:', err);
        }
      });

      this.client.on('ready', async () => {
        logger.info('[WhatsAppWorker] Client is READY!');
        await this.repository.updateSessionState('default', { status: 'connected', qr_code: '' });
        await this.repository.logEvent('info', 'Session connected and ready');
      });

      this.client.on('disconnected', async (reason: any) => {
        logger.warn('[WhatsAppWorker] Logged out or unpaired', reason);
        await this.repository.updateSessionState('default', { status: 'disconnected' });
        this.client = null;
        this.isInitializing = false;
      });

      await this.client.initialize();

    } catch (error) {
      logger.error('[WhatsAppWorker] Failed to initialize:', error);
      await this.repository.updateSessionState('default', { status: 'failed' as any });
      await this.repository.logEvent('error', 'Initialization failed', { error: String(error) });
    } finally {
      this.isInitializing = false;
    }
  }

  async sendMessage(to: string | number, payload: Omit<WhatsAppMessagePayload, 'to'>) {
    if (!this.client) {
      throw new Error('WhatsApp client is not initialized or connected');
    }

    const toString = String(to);
    let chatId = toString.replace(/[^0-9]/g, '');
    if (!chatId.endsWith('@c.us')) {
      chatId = `${chatId}@c.us`;
    }

    logger.info(`[WhatsAppWorker] Sending message to ${chatId}`);

    try {
      // Prevent "Cannot read properties of undefined (reading 'getChat')" by validating the number first
      const numberId = await this.client.getNumberId(chatId);
      if (!numberId) {
        throw new Error(`Phone number ${chatId} is not registered on WhatsApp.`);
      }

      const validChatId = numberId._serialized;

      if (payload.type === 'text' || !payload.type) {
        const result = await this.client.sendMessage(validChatId, payload.content);
        return result;
      }
      throw new Error(`Unsupported message type: ${payload.type}`);
    } catch (error) {
      logger.error(`[WhatsAppWorker] Error sending message to ${chatId}:`, error);
      throw error;
    }
  }

  async restart() {
    logger.info('[WhatsAppWorker] Restarting session (keeping login)...');
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (e) {
        logger.error('[WhatsAppWorker] Error destroying client:', e);
      }
      this.client = null;
    }
    this.isInitializing = false;
    await this.initialize();
  }

  async generateQR() {
    logger.info('[WhatsAppWorker] Wiping session and generating new QR...');
    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
      } catch (e) {
        logger.error('[WhatsAppWorker] Error logging out/destroying client:', e);
      }
      this.client = null;
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      const sessionDir = path.join(process.cwd(), '.wwebjs_auth');
      if (fs.existsSync(sessionDir)) {
         fs.rmSync(sessionDir, { recursive: true, force: true });
      }
    } catch(e) {
      logger.debug('[WhatsAppWorker] Ignored error while cleaning auth dir:', e);
    }

    this.isInitializing = false;
    await this.initialize();
  }

  async getQrCode() {
    const session = await this.repository.getSession('default');
    return session?.qr_code || null;
  }
}

export const whatsappWorkerService = new WhatsAppWorkerService();
