import { supabase } from '../backend/src/config/supabase.js';

async function checkLeadsTable() {
  const { error } = await supabase.from('leads').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Leads table check failed:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('SUGGESTION: Create "leads" table in Supabase.');
    }
  } else {
    console.log('Leads table exists.');
  }
}

checkLeadsTable();
