import { handleWebhookEvent } from './src/modules/whatsapp/whatsapp.webhook.controller.js';
import { redis } from './src/config/redis.js';

async function run() {
  const req = {
    headers: {},
    body: {
      event: 'messages.upsert',
      instance: 'test-instance',
      data: {
        key: {
          remoteJid: '1234567890@s.whatsapp.net',
          fromMe: false,
          id: 'evo-test-msg-1'
        },
        pushName: 'Evolution Tester',
        message: {
          conversation: 'support'
        }
      }
    }
  };

  const res = {
    sendStatus: (code: number) => console.log('sendStatus:', code),
    status: (code: number) => ({ send: (msg: string) => console.log('status', code, msg) })
  };

  try {
    await handleWebhookEvent(req as any, res as any);
    console.log('Handler finished. Waiting 2s for queue...');
    setTimeout(async () => {
      console.log('Exiting...');
      process.exit(0);
    }, 2000);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
