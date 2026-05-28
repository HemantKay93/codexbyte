import { getAdminClient } from './src/config/supabase.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Fetching global settings...');
  const admin = await getAdminClient();
  const { data, error } = await admin.from('cms_settings').select('*').eq('type', 'global');

  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }

  const waConfig = data?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
  console.log('WA Config in DB:', waConfig);
  console.log('Expected Token from DB:', waConfig.webhookVerifyToken);
  console.log('ENV Token:', process.env.WHATSAPP_VERIFY_TOKEN);
}

run().catch(console.error);
