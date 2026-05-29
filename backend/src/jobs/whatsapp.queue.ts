import { Queue } from 'bullmq';

import { redis } from '../config/redis.js';

// Define the Queue for WhatsApp Jobs
export const whatsappQueue = new Queue('whatsapp-queue', {
  skipVersionCheck: true, connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for manual inspection and retry
  },
});
