import path from 'path';
import { fileURLToPath } from 'url';

import { Redis } from 'ioredis';
import dotenv from 'dotenv';

import { env } from './/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let REDIS_URL = env.REDIS_URL || 'redis://localhost:6379';

// Auto-fix: Upstash requires TLS but sometimes users copy the non-TLS string
if (REDIS_URL.includes('upstash.io') && REDIS_URL.startsWith('redis://')) {
  REDIS_URL = REDIS_URL.replace('redis://', 'rediss://');
}

const isUpstashOrTls = REDIS_URL.startsWith('rediss://');

export const redisConfig = {
  connection: new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true, // Required for BullMQ on Upstash to prevent "Stream isn't writeable"
    enableReadyCheck: false, // Recommended for Upstash
    connectTimeout: 10000,
    family: 0, // Critical for Upstash
    ...(isUpstashOrTls && { tls: { rejectUnauthorized: false } }),
    retryStrategy(times: number) {
      // Never return null, otherwise ioredis stops reconnecting and throws "Connection is closed."
      // Upstash frequently drops idle connections, so we must always try to reconnect.
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  }),
};

export const redis = redisConfig.connection;

redis.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'ECONNREFUSED') {
    console.warn(
      '⚠️ [Redis] Connection refused. Ensure Redis is running for background jobs and caching.'
    );
  } else {
    console.error('[Redis] Error:', err);
  }
});
