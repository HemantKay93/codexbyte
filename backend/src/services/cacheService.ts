/**
 * Two-layer cache service:
 *   L1 — In-process memory (Map). Zero network cost. TTL managed via setTimeout.
 *   L2 — Redis (Upstash). Used only on L1 miss.
 *
 * Strategy:
 *   GET  → check L1 first, then L2 (store result back in L1)
 *   SET  → write to both L1 and L2
 *   DEL  → evict from both
 *
 * This dramatically reduces Redis commands for high-read keys
 * (e.g. product lists, templates, CMS content) while keeping
 * data consistent across short time windows.
 */

import { redis } from '../config/redis.js';
import logger from './logger.js';

const isRedisReady = () => redis.status === 'ready';

// ─── L1: In-Process Memory Cache ────────────────────────────────────────────
interface L1Entry {
  value: any;
  timer: ReturnType<typeof setTimeout>;
}

const L1: Map<string, L1Entry> = new Map();

const l1Get = <T>(key: string): T | null => {
  const entry = L1.get(key);
  return entry ? (entry.value as T) : null;
};

const l1Set = (key: string, value: any, ttlSeconds: number): void => {
  // Clear any existing timer for this key
  const existing = L1.get(key);
  if (existing) clearTimeout(existing.timer);

  const timer = setTimeout(() => L1.delete(key), ttlSeconds * 1000);
  // Allow the timer to not block Node.js process exit
  if (timer.unref) timer.unref();
  L1.set(key, { value, timer });
};

const l1Del = (key: string): void => {
  const entry = L1.get(key);
  if (entry) {
    clearTimeout(entry.timer);
    L1.delete(key);
  }
};

// ─── L1 TTL Strategy ─────────────────────────────────────────────────────────
// Short L1 TTL keeps memory fresh without Redis calls.
// Heavy-read, rarely-changed keys get longer L1 TTL.
const L1_DEFAULT_TTL = 30; // 30 seconds for most keys
const L1_LONG_TTL = 120; // 2 minutes for stable data (templates, config)

const getL1Ttl = (key: string): number => {
  if (
    key.startsWith('whatsapp:') ||
    key.startsWith('cms:') ||
    key.startsWith('templates:') ||
    key.startsWith('products:') ||
    key.startsWith('user_profile:')
  ) {
    return L1_LONG_TTL;
  }
  return L1_DEFAULT_TTL;
};

// ─── Public API ───────────────────────────────────────────────────────────────
export class CacheService {
  /**
   * Get value — L1 first, then Redis.
   * Saves a Redis command on every L1 hit.
   */
  static async get<T>(key: string): Promise<T | null> {
    // L1 hit — zero Redis cost
    const l1Val = l1Get<T>(key);
    if (l1Val !== null) return l1Val;

    // L2 — Redis
    if (!isRedisReady()) return null;
    try {
      const data = await redis.get(key);
      if (!data) return null;
      const parsed = JSON.parse(data) as T;
      // Backfill L1 so next call is free
      l1Set(key, parsed, getL1Ttl(key));
      return parsed;
    } catch (err) {
      logger.warn(`[Cache] GET error for ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Set value in both L1 and Redis.
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    // Write L1 first (always succeeds, no network)
    l1Set(key, value, Math.min(ttlSeconds, getL1Ttl(key)));

    // Write L2
    if (!isRedisReady()) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn(`[Cache] SET error for ${key}: ${(err as Error).message}`);
    }
  }

  /**
   * Delete from both L1 and Redis.
   */
  static async del(key: string): Promise<void> {
    l1Del(key);
    if (!isRedisReady()) return;
    try {
      await redis.del(key);
    } catch (err) {
      logger.warn(`[Cache] DEL error for ${key}: ${(err as Error).message}`);
    }
  }

  /**
   * Invalidate all keys matching a pattern.
   * Uses Redis SCAN instead of KEYS to avoid blocking large keyspaces.
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    // Evict L1 entries matching the pattern (simple prefix check)
    const prefix = pattern.replace('*', '');
    for (const key of L1.keys()) {
      if (key.startsWith(prefix)) l1Del(key);
    }

    if (!isRedisReady()) return;
    try {
      // Use SCAN instead of KEYS — non-blocking, safe for production
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      logger.warn(`[Cache] SCAN/DEL error for pattern ${pattern}: ${(err as Error).message}`);
    }
  }

  /** Return number of keys in the L1 in-memory cache (for diagnostics). */
  static l1Size(): number {
    return L1.size;
  }
}
