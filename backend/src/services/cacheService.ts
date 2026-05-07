import { redis } from '../config/redis.js';
import logger from './logger.js';

export class CacheService {
  /**
   * Get cached data by key
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.error(`[Cache] Error getting key ${key}:`, err);
      return null;
    }
  }

  /**
   * Set cache with TTL (in seconds)
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.error(`[Cache] Error setting key ${key}:`, err);
    }
  }

  /**
   * Delete cached data
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error(`[Cache] Error deleting key ${key}:`, err);
    }
  }

  /**
   * Invalidate by pattern (e.g., "products:*")
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.error(`[Cache] Error invalidating pattern ${pattern}:`, err);
    }
  }
}
