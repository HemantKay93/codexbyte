import { getAdminClient } from '../../config/supabase.js';
import { Queue } from 'bullmq';
import { redis } from '../../config/redis.js';
import logger from '../../services/logger.js';

export class DLQService {
  async getDeadLetters(page: number = 1, limit: number = 20) {
    const admin = await getAdminClient();
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await admin
      .from('dlq_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw new Error(error.message);

    return {
      data,
      metadata: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  }

  async retryJob(id: string) {
    const admin = await getAdminClient();

    // 1. Fetch the DLQ job
    const { data: dlqJob, error } = await admin.from('dlq_jobs').select('*').eq('id', id).single();

    if (error || !dlqJob) {
      throw new Error('DLQ Job not found');
    }

    if (dlqJob.status === 'resolved') {
      throw new Error('Job already resolved');
    }

    logger.info(`[DLQService] Retrying job ${id} from queue ${dlqJob.queue_name}`);

    // 2. Add back to the original BullMQ queue
    const queue = new Queue(dlqJob.queue_name, { connection: redis });
    await queue.add(dlqJob.job_name, dlqJob.payload, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    // 3. Mark as resolved
    await admin
      .from('dlq_jobs')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', id);

    await queue.close();

    return { success: true, message: 'Job requeued successfully' };
  }

  async resolveJob(id: string) {
    const admin = await getAdminClient();
    const { error } = await admin
      .from('dlq_jobs')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true, message: 'Job marked as resolved' };
  }
}
