import { getAdminClient } from './src/config/supabase.js';

async function test() {
  try {
    const admin = await getAdminClient();
    console.log('Testing upsert...');
    const { data, error } = await admin
      .from('provider_configs')
      .upsert(
        {
          provider_name: 'meta',
          is_enabled: true,
          priority: 1,
          config: { accessToken: '123' },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider_name' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase Error on Upsert:', error);
    } else {
      console.log('Upsert Success! Data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
