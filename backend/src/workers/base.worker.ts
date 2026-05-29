import { Worker, Job, WorkerOptions } from 'bullmq';

import { redis } from '../config/redis.js';
import { getAdminClient } from '../config/supabase.js';
import logger from '../services/logger.js';

export abstract class BaseWorker<T = any> {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-explicit-any
  protected worker: Worker;

  constructor(queueName: string, options?: Omit<WorkerOptions, 'connection'>) {
    this.worker = new Worker<T>(queueName, async (job: Job<T>) => this.process(job), {
      skipVersionCheck: true, connection: redis,
      ...options,
    });

    this.worker.on('failed', async (job, err) => {
      logger.error(`[${this.constructor.name}] Job ${job?.id} failed:`, err);
      this.onFailed(job, err);

      // DLQ Logic
      if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
        await this.moveToDLQ(job, err);
      }
    });

    this.worker.on('completed', (job) => {
      logger.info(`[${this.constructor.name}] Job ${job.id} completed successfully`);
      this.onCompleted(job);
    });

    logger.info(`[${this.constructor.name}] Initialized worker for queue: ${queueName}`);
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  abstract process(job: Job<T>): Promise<any>;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-unused-vars

  // eslint-disable-line @typescript-eslint/no-unused-vars
  protected onFailed(job: Job<T> | undefined, err: Error): void {}
  // eslint-disable-line @typescript-eslint/no-unused-vars
  protected onCompleted(job: Job<T>): void {}
  // eslint-disable-line @typescript-eslint/no-unused-vars

  protected async moveToDLQ(job: Job<T>, err: Error) {
    try {
      logger.info(`[DLQ] Moving job ${job.id} to DLQ table.`);
      const admin = await getAdminClient();
      await admin.from('dlq_jobs').insert({
        queue_name: this.worker.name,
        job_name: job.name,
        payload: job.data,
        error_message: err.message,
        stack_trace: err.stack,
        status: 'unresolved',
      });
    } catch (dlqErr) {
      logger.error(`[DLQ] Failed to record dead-letter job:`, dlqErr);
    }
  }

  async close() {
    logger.info(`[${this.constructor.name}] Closing worker...`);
    await this.worker.close();
  }
}
