import { getAdminClient } from './src/config/supabase.js';

async function run() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, created_at, subject, status, source, customer_name, description')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Latest Tickets:", JSON.stringify(data, null, 2));
  }
  process.exit(0);
}
run();
