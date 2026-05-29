import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: rows } = await supabase.from('orders').select('*').limit(1);
  if (rows && rows.length > 0) console.log(Object.keys(rows[0]));
  else {
    const { data } = await supabase.from('orders').select('*');
    if (data && data.length === 0) {
      console.log('No rows, cant check keys this way. Checking via invalid insert...');
      const { error } = await supabase.from('orders').insert({}).select().single();
      console.log(error);
    }
  }
}
main();
