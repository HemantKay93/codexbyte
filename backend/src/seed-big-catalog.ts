import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '../.env' }); // load from project root

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = {
  laptop_mac: {
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Razer'],
    adjectives: ['Pro', 'Ultra', 'Gaming', 'Elite', 'Zen', 'Stealth'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1531297172867-1117181cf863?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800'
    ]
  },
  desktop_windows: {
    brands: ['Alienware', 'CyberPower', 'Corsair', 'HP Omen', 'NZXT'],
    adjectives: ['Core', 'Aurora', 'Vengeance', 'Legion', 'Predator'],
    images: [
      'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1624705002806-5d72df19c3cb?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1603512534575-b8830f5c1d3c?auto=format&fit=crop&w=800'
    ]
  },
  keyboard_mouse: {
    brands: ['Logitech G', 'Razer', 'Corsair', 'SteelSeries', 'HyperX'],
    adjectives: ['Mechanical', 'Wireless', 'Pro X', 'Elite', 'RGB'],
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1527814050087-379381547336?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1622340398687-0b1e4fb6729d?auto=format&fit=crop&w=800'
    ]
  },
  monitor: {
    brands: ['LG', 'Samsung', 'BenQ', 'AOC', 'Asus ROG'],
    adjectives: ['UltraWide', 'Curved', '4K', 'OLED', '144Hz'],
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800'
    ]
  }
};

const tagsPool = ['dod', 'clearance', 'new', 'trending'];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('Fetching active warehouse...');
  let { data: warehouse } = await supabase.from('warehouses').select('id').eq('is_active', true).limit(1).single();
  
  if (!warehouse) {
    const wId = randomUUID();
    await supabase.from('warehouses').insert({
      id: wId, name: 'Primary Warehouse', location: 'Earth', is_active: true
    });
    warehouse = { id: wId };
  }

  const productsToInsert = [];
  
  for (const [category, data] of Object.entries(categories)) {
    for (let i = 0; i < 20; i++) {
      const brand = data.brands[Math.floor(Math.random() * data.brands.length)];
      const adjective = data.adjectives[Math.floor(Math.random() * data.adjectives.length)];
      const modelNum = Math.floor(Math.random() * 9000) + 1000;
      const name = `${brand} ${adjective} ${modelNum}`;
      
      const price = Math.floor(Math.random() * 1500) + 50;
      const hasDiscount = Math.random() > 0.5;
      const original_price = hasDiscount ? price * 1.2 : null;
      
      const tagCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 tags
      const productTags = [...tagsPool].sort(() => 0.5 - Math.random()).slice(0, tagCount);

      const productId = randomUUID();

      productsToInsert.push({
        id: productId,
        name,
        slug: slugify(name),
        description: `Experience the pinnacle of technology with the ${name}. Features advanced cooling, premium build quality, and unmatched performance for the ultimate user experience.`,
        specifications: {
          Weight: `${(Math.random() * 5 + 1).toFixed(1)} lbs`,
          Dimensions: 'Various',
          Warranty: '2 Years Manufacturer'
        },
        price,
        original_price,
        image_url: data.images[i % data.images.length],
        category,
        brand,
        sku: `${brand.toUpperCase().substring(0, 3)}-${modelNum}`,
        stock_quantity: Math.floor(Math.random() * 100) + 10,
        tags: productTags,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  console.log(`Inserting ${productsToInsert.length} products...`);
  
  // Insert in batches of 20
  for (let i = 0; i < productsToInsert.length; i += 20) {
    const batch = productsToInsert.slice(i, i + 20);
    const { error: pErr } = await supabase.from('products').insert(batch);
    if (pErr) console.error('Product Batch Error:', pErr.message);

    // Insert Inventory
    const inventoryBatch = batch.map(p => ({
      product_id: p.id,
      warehouse_id: warehouse.id,
      quantity: p.stock_quantity,
      reserved_quantity: 0,
      min_stock_level: 5,
      updated_at: new Date().toISOString()
    }));

    const { error: iErr } = await supabase.from('inventory').insert(inventoryBatch);
    if (iErr) console.error('Inventory Batch Error:', iErr.message);
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
