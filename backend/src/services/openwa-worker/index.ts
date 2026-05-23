import 'dotenv/config';
import express from 'express';
import { Worker } from 'bullmq';
import { redis } from '../../config/redis.js';
import logger from '../logger.js';
import { whatsappWorkerService } from './workerService.js';
import { WhatsAppRepository } from '../../modules/whatsapp/whatsapp.repository.js';

const whatsappRepo = new WhatsAppRepository();

async function bootstrap() {
  logger.info('======================================');
  logger.info('[WhatsApp Bot] Starting Standalone Service...');
  logger.info('======================================');

  try {
    // 1. Initialize the Open-WA Engine
    await whatsappWorkerService.initialize();

    // 2. Start the BullMQ Worker explicitly in this separate process
    const worker = new Worker(
      'whatsapp-queue',
      async (job) => {
        // Handle remote control commands
        if (job.name === 'control') {
          const { action } = job.data;
          if (action === 'restart') {
            await whatsappWorkerService.restart();
          } else if (action === 'generate_qr') {
            await whatsappWorkerService.generateQR();
          }
          return { success: true };
        }

        const { to, payload, jobId } = job.data;
        logger.info(`[WhatsApp Bot] Processing job ${job.id} to send message to ${to}`);
        try {
          await whatsappWorkerService.sendMessage(to, payload);
          if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'sent');
          return { success: true };
        } catch (err: any) {
          logger.error(`[WhatsApp Bot] Failed to send message:`, err);
          if (jobId) await whatsappRepo.updateMessageStatus(jobId, 'failed', err.message);
          throw err;
        }
      },
      {
        connection: redis,
        concurrency: 1,
        limiter: {
          max: 1,
          duration: 3000
        }
      }
    );

    worker.on('failed', (job, err) => {
      logger.error(`[WhatsApp Bot] Job ${job?.id} failed in queue:`, err);
    });

    logger.info('[WhatsApp Bot] Listening for outgoing messages on "whatsapp-queue"...');
    
    // 3. Hack: Start a dummy HTTP server so Render thinks this is a valid "Web Service"
    // This allows deploying the worker on Render's free tier instead of paying for a Background Worker.
    const app = express();
    app.get('/', (req, res) => res.send('WhatsApp Worker is running!'));
    const port = process.env.PORT || 10000;
    app.listen(port, () => {
      logger.info(`[WhatsApp Bot] Dummy HTTP Server listening on port ${port} (Render Bypass)`);
    });

  } catch (error) {
    logger.error('[WhatsApp Bot] Critical Error during startup:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('[WhatsApp Bot] Shutting down...');
  process.exit(0);
});

bootstrap();
