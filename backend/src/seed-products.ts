import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // load from project root

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyProducts = [
  {
    name: 'Titan G15 Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 4080.',
    price: 1999.99,
    original_price: 2499.99,
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
    category: 'laptop_mac',
    brand: 'Titan',
    sku: 'TITAN-G15-001',
    stock_quantity: 50,
    tags: ['deal of the day', 'dod', 'trending'],
    status: 'active',
    reviews: [{ user: 'Alex', rating: 5, comment: 'Amazing performance!' }]
  },
  {
    name: 'Stealth Pro Keyboard',
    description: 'Mechanical keyboard with RGB lighting.',
    price: 129.99,
    original_price: 159.99,
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212',
    category: 'keyboard_mouse',
    brand: 'Stealth',
    sku: 'STEALTH-KB-002',
    stock_quantity: 100,
    tags: ['clearance', 'trending'],
    status: 'active',
    reviews: [{ user: 'Sarah', rating: 4.5, comment: 'Great typing feel.' }]
  },
  {
    name: 'Quantum UltraWide Monitor',
    description: '34" Curved Gaming Monitor, 144Hz.',
    price: 499.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
    category: 'monitor',
    brand: 'Quantum',
    sku: 'QUANTUM-MON-003',
    stock_quantity: 25,
    tags: ['new', 'trending'],
    status: 'active',
    reviews: [{ user: 'Mike', rating: 5, comment: 'Beautiful colors.' }]
  },
  {
    name: 'CyberLink Pro Mouse',
    description: 'Ultra-lightweight wireless gaming mouse.',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
    category: 'keyboard_mouse',
    brand: 'CyberLink',
    sku: 'CYBER-MS-004',
    stock_quantity: 75,
    tags: ['new', 'clearance'],
    status: 'active',
    reviews: [{ user: 'Emily', rating: 4, comment: 'Very responsive.' }]
  },
  {
    name: 'Nexus Core Desktop PC',
    description: 'Pre-built desktop with RTX 4070.',
    price: 1499.99,
    original_price: 1699.99,
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c',
    category: 'desktop_windows',
    brand: 'Nexus',
    sku: 'NEXUS-PC-005',
    stock_quantity: 10,
    tags: ['deal of the day', 'dod', 'trending'],
    status: 'active',
    reviews: [{ user: 'Dave', rating: 5, comment: 'Handles everything I throw at it.' }]
  }
];

async function seed() {
  console.log('Seeding products...');
  for (const product of dummyProducts) {
    const { error } = await supabase.from('products').insert(product);
    if (error) {
      console.error(`Error inserting ${product.name}:`, error.message);
    } else {
      console.log(`Inserted ${product.name}`);
    }
  }
  console.log('Done!');
}

seed();
