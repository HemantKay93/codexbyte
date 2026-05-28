import { CMSService } from './src/modules/cms/cms.service.js';
import { MetaWhatsAppProvider } from './src/core/providers/MetaWhatsAppProvider.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const currentSettings = await CMSService.getContent('global');
  const waConfig =
    currentSettings?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};

  const provider = new MetaWhatsAppProvider();
  await provider.initialize({
    accessToken: waConfig.accessToken,
    phoneNumberId: waConfig.phoneNumberId,
  });

  console.log('Sending TEMPLATE message...');
  const res = await provider.sendMessage({
    to: '918076635292', // Assuming this is the test number
    content: '',
    metadata: {
      type: 'template',
      templateId: 'hello_world', // Default Meta template
    },
  });

  console.log('Template Result:', res);
}

test().catch(console.error);
