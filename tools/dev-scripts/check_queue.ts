import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis('redis://localhost:6379', { maxRetriesPerRequest: null });
const queue = new Queue('whatsapp-queue', { connection });

async function check() {
  const active = await queue.getActiveCount();
  const waiting = await queue.getWaitingCount();
  const failed = await queue.getFailedCount();
  const completed = await queue.getCompletedCount();
  const delayed = await queue.getDelayedCount();
  const isPaused = await queue.isPaused();
  
  if (isPaused) {
    console.log('Queue is paused! Resuming it now...');
    await queue.resume();
    console.log('Queue resumed successfully!');
  }
  
  console.log({ active, waiting, failed, completed, delayed, isPaused });

  const activeJobs = await queue.getActive();
  if (activeJobs.length > 0) {
    console.log('Active job example:', activeJobs[0].id, activeJobs[0].name, activeJobs[0].data);
  }
  
  const failedJobs = await queue.getFailed();
  if (failedJobs.length > 0) {
    console.log('Failed job example:', failedJobs[0].id, failedJobs[0].name, failedJobs[0].failedReason);
  }

  process.exit(0);
}

check();
