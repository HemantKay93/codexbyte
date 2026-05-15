import { supabase } from '../backend/src/config/supabase.js';

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'cms_content' });
  if (error) {
    // If RPC doesn't exist, try a raw query if possible, but usually we can't.
    // So let's try to just fetch one row and see the columns.
    const { data: row, error: rowError } = await supabase.from('cms_content').select('*').limit(1);
    console.log('Columns:', row ? Object.keys(row[0]) : 'None');

    // Check if we can get constraints via a query
    const { data: constraints, error: constError } = await supabase
      .from('pg_constraint')
      .select('*');
    // Note: This might not work via Supabase client depending on permissions.
  } else {
    console.log('Table info:', data);
  }
}

checkSchema();
