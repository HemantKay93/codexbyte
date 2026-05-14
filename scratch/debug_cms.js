import { supabase } from '../backend/src/config/supabase.js';

async function debugCmsData() {
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page_slug', 'contact_page')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching CMS data:', error.message);
  } else {
    console.log('--- CMS Data for contact_page ---');
    data.forEach((row) => {
      console.log(`Section: ${row.section_key}, Updated: ${row.updated_at}`);
      console.log('Content:', JSON.stringify(row.content, null, 2));
      console.log('--------------------------------');
    });
  }
}

debugCmsData();
