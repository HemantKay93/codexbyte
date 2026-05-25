import { getAdminClient } from './src/config/supabase.js';

async function checkLogs() {
  const admin = await getAdminClient();

  console.log('--- Provider Configs ---');
  const { data: configs } = await admin.from('provider_configs').select('*');
  console.log(JSON.stringify(configs, null, 2));

  console.log('\n--- Provider Logs ---');
  const { data: logs } = await admin
    .from('provider_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(JSON.stringify(logs, null, 2));

  console.log('\n--- Recent Messages ---');
  const { data: msgs } = await admin
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(JSON.stringify(msgs, null, 2));
}

checkLogs().catch(console.error);
