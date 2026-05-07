import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConfig = {
  connection: new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  }),
};

export const redis = redisConfig.connection;
