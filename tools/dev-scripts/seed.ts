import { supabase, getAdminClient } from './backend/src/config/supabase.js';

async function checkProducts() {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('products').select('*');
  console.log('Products:', data);
  if (error) console.error('Error:', error);

  if (!data || data.length === 0) {
    console.log('Database is empty. Seeding a test product...');
    const { error: insertErr } = await admin.from('products').insert([
      {
        name: 'ByteEvolvr Pro Workstation',
        sku: 'BE-WS-001',
        price: 2499.99,
        stock_quantity: 50
      }
    ]);
    if (insertErr) console.error('Seed error:', insertErr);
    else console.log('Seeded successfully!');
  }
}

checkProducts().then(() => process.exit(0));
