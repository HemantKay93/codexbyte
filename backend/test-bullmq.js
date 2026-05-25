import { whatsappQueue } from './src/jobs/whatsapp.queue.js';

async function checkQueue() {
  const waiting = await whatsappQueue.getWaiting();
  const active = await whatsappQueue.getActive();
  const delayed = await whatsappQueue.getDelayed();
  const failed = await whatsappQueue.getFailed();
  const completed = await whatsappQueue.getCompleted();

  console.log(`Waiting: ${waiting.length}`);
  console.log(`Active: ${active.length}`);
  console.log(`Delayed: ${delayed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Completed: ${completed.length}`);

  if (failed.length > 0) {
    console.log('--- Sample Failed Job ---');
    console.log('ID:', failed[0].id);
    console.log('Failed Reason:', failed[0].failedReason);
    console.log('Data:', failed[0].data);
  }
}

checkQueue()
  .then(() => process.exit(0))
  .catch(console.error);
