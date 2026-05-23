import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../jobService.js';
import { emailQueue, notificationQueue, analyticsQueue } from '../../jobs/index.js';
import logger from '../logger.js';
import { redis } from '../../config/redis.js';

// Mock dependencies
vi.mock('../../jobs/index.js', () => ({
  emailQueue: { add: vi.fn() },
  notificationQueue: { add: vi.fn() },
  analyticsQueue: { add: vi.fn() }
}));

vi.mock('../logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../config/redis.js', () => ({
  redis: {
    status: 'ready'
  }
}));

describe('JobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue analytics event if Redis is ready', async () => {
    // redis.status is 'ready' by default in our mock
    (analyticsQueue.add as any).mockResolvedValue(true);

    await JobService.dispatchAnalyticsEvent('test_event', { foo: 'bar' });

    expect(analyticsQueue.add).toHaveBeenCalledWith(
      'record-event',
      { type: 'test_event', payload: { foo: 'bar' } },
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('queued'));
  });

  it('should ignore analytics event if Redis is not ready', async () => {
    // Change mock status
    (redis as any).status = 'end';

    await JobService.dispatchAnalyticsEvent('test_event', { foo: 'bar' });

    expect(analyticsQueue.add).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Redis unavailable'));

    // Revert mock status
    (redis as any).status = 'ready';
  });
});
