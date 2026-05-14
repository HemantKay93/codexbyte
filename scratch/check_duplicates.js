import { supabase } from '../backend/src/config/supabase.js';

async function checkDuplicates() {
  console.log('Checking for duplicate rows in cms_content...');
  const { data, error } = await supabase
    .from('cms_content')
    .select('page_slug, section_key, count()')
    .select('page_slug, section_key');

  const { data: allRows } = await supabase.from('cms_content').select('*');

  const counts = {};
  allRows.forEach((row) => {
    const key = `${row.page_slug}:${row.section_key}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  console.log('Row counts by slug:key :');
  console.log(counts);

  const duplicates = Object.entries(counts).filter(([key, count]) => count > 1);
  if (duplicates.length > 0) {
    console.warn('FOUND DUPLICATES:', duplicates);
  } else {
    console.log('No duplicates found.');
  }
}

checkDuplicates();
