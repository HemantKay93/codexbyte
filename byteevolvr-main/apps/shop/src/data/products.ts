export const products = [
  {
    id: 'dell-latitude-5540',
    slug: 'dell-latitude-5540',
    name: 'Dell Latitude 5540 Laptop',
    description: 'Intel Core i7, 16GB RAM, 512GB SSD, enterprise-ready laptop for office and hybrid teams.',
    price: 89999,
    originalPrice: 99999,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80',
    category: 'Laptops',
    brand: 'Dell',
    rating: 4.8,
    stockQuantity: 15,
    tags: ['business', 'laptop', 'office'],
    manufacturer: 'Dell Technologies India Pvt Ltd',
    specs: {
      Processor: 'Intel Core i7-1355U',
      RAM: '16GB DDR4 3200MHz',
      Storage: '512GB NVMe SSD',
      Display: '15.6" Full HD (1920x1080)',
      OS: 'Windows 11 Pro'
    },
    variants: ['8GB/256GB', '16GB/512GB', '32GB/1TB']
  },
  {
    id: 'hp-laserjet-pro-m404dn',
    slug: 'hp-laserjet-pro-m404dn',
    name: 'HP LaserJet Pro M404dn',
    description: 'High-volume monochrome laser printer with duplex printing for SMBs and admin offices.',
    price: 24999,
    originalPrice: 28999,
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=1200&q=80',
    category: 'Printers',
    brand: 'HP',
    rating: 4.6,
    stockQuantity: 8,
    tags: ['printer', 'office', 'duplex'],
    manufacturer: 'HP India Sales Pvt Ltd',
    specs: {
      'Print Speed': 'Up to 40 ppm',
      'Duty Cycle': '80,000 pages',
      Connectivity: 'USB 2.0, Ethernet',
      'Duplex Printing': 'Automatic'
    },
    variants: ['Standard']
  },
  {
    id: 'logitech-mx-master-3s',
    slug: 'logitech-mx-master-3s',
    name: 'Logitech MX Master 3S',
    description: 'Premium wireless productivity mouse designed for developers, analysts, and creators.',
    price: 8999,
    originalPrice: 10999,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=80',
    category: 'Peripherals',
    brand: 'Logitech',
    rating: 4.9,
    stockQuantity: 42,
    tags: ['mouse', 'wireless', 'creator'],
    manufacturer: 'Logitech Asia Pacific',
    specs: {
      Sensor: 'Darkfield High Precision',
      DPI: '8000 max',
      Battery: 'Rechargeable Li-Po (500 mAh)',
      Buttons: '7 programmable buttons'
    },
    variants: ['Graphite', 'Pale Grey']
  },
];
