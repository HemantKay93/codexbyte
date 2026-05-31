import { getAdminClient } from './src/config/supabase.js';

async function run() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('provider_configs')
    .select('*')
    .eq('provider_name', 'evolution')
    .single();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Evolution Config:", JSON.stringify(data.config, null, 2));
  }
  process.exit(0);
}
run();
