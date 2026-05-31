import axios from 'axios';

async function run() {
  const payload = {
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
  };

  try {
    const res = await axios.post('http://localhost:3010/api/v1/whatsapp/webhook', payload);
    console.log('Webhook sent!', res.status, res.data);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
