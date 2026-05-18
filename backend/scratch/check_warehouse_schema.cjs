const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'warehouses' });
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema if possible
    console.error('RPC failed, trying direct select...');
    const { data: cols, error: colError } = await supabase.from('warehouses').select('*').limit(0);
    if (colError) {
      console.error(colError);
    } else {
      console.log('Warehouses columns (via limit 0):', Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Warehouses columns:', data);
  }
}

checkSchema();
