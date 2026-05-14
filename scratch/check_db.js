import { supabase } from '../backend/src/config/supabase.js';

async function checkRow() {
  console.log('Checking row for contact_page:details...');
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page_slug', 'contact_page')
    .eq('section_key', 'details');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Row found:', JSON.stringify(data, null, 2));
  }
}

checkRow();
