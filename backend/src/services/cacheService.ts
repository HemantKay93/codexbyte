import { redis } from '../config/redis.js';
import logger from './logger.js';

/** Returns true only when the ioredis client has an active connection */
const isRedisReady = () => redis.status === 'ready';

export class CacheService {
  /**
   * Get cached data by key.
   * Returns null silently if Redis is not available.
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!isRedisReady()) return null;
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn(`[Cache] Error getting key ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Set cache with TTL (in seconds).
   * Skips silently if Redis is not available.
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!isRedisReady()) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn(`[Cache] Error setting key ${key}: ${(err as Error).message}`);
    }
  }

  /**
   * Delete cached data.
   * Skips silently if Redis is not available.
   */
  static async del(key: string): Promise<void> {
    if (!isRedisReady()) return;
    try {
      await redis.del(key);
    } catch (err) {
      logger.warn(`[Cache] Error deleting key ${key}: ${(err as Error).message}`);
    }
  }

  /**
   * Invalidate by pattern (e.g., "products:*").
   * Skips silently if Redis is not available.
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    if (!isRedisReady()) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.warn(`[Cache] Error invalidating pattern ${pattern}: ${(err as Error).message}`);
    }
  }
}

