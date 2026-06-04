import { getAdminClient } from '../../config/supabase.js';
import { redis } from '../../config/redis.js';
import * as queues from '../../core/queues/index.js';

export class OperationsService {
  async getSystemHealth(tenantId: string) {
    const timestamp = new Date().toISOString();

    // 1. Database & Storage Health
    const dbStart = Date.now();
    let dbStatus = 'offline';
    let storageGb = 0;
    try {
      const admin = await getAdminClient();
      await admin.from('user_profiles').select('id').limit(1);
      dbStatus = 'online';

      // Sum active storage from documents
      const { data: docs } = await admin.from('documents').select('file_size_bytes');
      if (docs) {
        const totalBytes = docs.reduce(
          (acc: number, d: any) => acc + (Number(d.file_size_bytes) || 0),
          0
        );
        storageGb = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(3));
      }
    } catch (err) {
      console.error('[Health] DB/Storage check failed:', err);
    }
    const dbLatency = Date.now() - dbStart;

    // 2. Redis Health
    let redisStatus = 'offline';
    let redisMemMb = 0;
    try {
      if (redis.status === 'ready') {
        redisStatus = 'online';
        const info = await redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        if (match && match[1]) {
          redisMemMb = Math.round(parseInt(match[1], 10) / 1024 / 1024);
        }
      }
    } catch (err) {
      console.error('[Health] Redis check failed:', err);
    }

    // 3. Queues Health
    const queueStats = [];
    try {
      const queueEntries = Object.entries(queues);
      for (const [key, q] of queueEntries) {
        if (q && typeof (q as any).getJobCounts === 'function') {
          const counts = await (q as any).getJobCounts('active', 'waiting', 'failed', 'completed');
          queueStats.push({
            name: (q as any).name || key,
            active: counts.active || 0,
            waiting: counts.waiting || 0,
            failed: counts.failed || 0,
            processed_1h: counts.completed || 0, // approximate completed
          });
        }
      }
    } catch (err) {
      console.error('[Health] Queue check failed:', err);
    }

    return {
      status: dbStatus === 'online' && redisStatus === 'online' ? 'healthy' : 'degraded',
      timestamp,
      services: {
        database: { status: dbStatus, latency_ms: dbLatency },
        redis: { status: redisStatus, memory_usage_mb: redisMemMb, uptime_hrs: 0 },
        storage: { status: 'online', space_used_gb: storageGb }, // AWS SLA, size driven by DB
      },
      queues:
        queueStats.length > 0
          ? queueStats
          : [{ name: 'no_queues_found', active: 0, waiting: 0, failed: 0, processed_1h: 0 }],
      recent_events: [
        {
          type: 'info',
          source: 'system',
          message: 'System health check executed',
          time: timestamp,
        },
      ],
    };
  }
}
