import { getAdminClient } from './src/config/supabase.js';

async function test() {
  try {
    console.log('Fetching admin client...');
    const admin = await getAdminClient();
    console.log('Client fetched. Querying provider_configs...');
    const { data, error } = await admin.from('provider_configs').select('*');
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
