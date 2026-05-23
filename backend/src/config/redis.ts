import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConfig = {
  connection: new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    retryStrategy(times: number) {
      if (times > 3) return null; // Stop retrying after 3 attempts
      const delay = Math.min(times * 50, 2000);
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
