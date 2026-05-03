export const shopProducts = [
  {
    id: '1',
    name: 'Dell XPS 15 (2025)',
    description: 'High-performance laptop for professionals with 4K OLED display and RTX 4070.',
    price: 249999,
    originalPrice: 289999,
    category: 'Laptops',
    brand: 'Dell',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 15,
  },
  {
    id: '2',
    name: 'HP LaserJet Pro M404dn',
    description: 'Fast, secure monochrome laser printer designed to let you focus on growing your business.',
    price: 28500,
    originalPrice: 32000,
    category: 'Printers',
    brand: 'HP',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 25,
  },
  {
    id: '3',
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with hyper-fast scrolling and ergonomic design.',
    price: 9999,
    originalPrice: 11499,
    category: 'Peripherals',
    brand: 'Logitech',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 50,
  },
  {
    id: '4',
    name: 'ThinkPad X1 Carbon Gen 11',
    description: 'Ultralight, premium business laptop with exceptional battery life.',
    price: 215000,
    originalPrice: 240000,
    category: 'Laptops',
    brand: 'Lenovo',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 10,
  },
  {
    id: '5',
    name: 'Samsung 34" Odyssey G5',
    description: 'Ultra-wide curved gaming monitor.',
    price: 45000,
    originalPrice: 55000,
    category: 'Monitors',
    brand: 'Samsung',
    imageUrl: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 5,
  },
  {
    id: '6',
    name: 'Apple MacBook Air M3',
    description: 'Lightweight and powerful.',
    price: 114900,
    originalPrice: 114900,
    category: 'Laptops',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 20,
  },
  {
    id: '7',
    name: 'Keychron K2 Wireless',
    description: 'Mechanical keyboard for Mac and Windows.',
    price: 8500,
    originalPrice: 9500,
    category: 'Peripherals',
    brand: 'Keychron',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 12,
  },
  {
    id: '8',
    name: 'Sony WH-1000XM5',
    description: 'Industry leading noise canceling headphones.',
    price: 29990,
    originalPrice: 34990,
    category: 'Audio',
    brand: 'Sony',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    stockQuantity: 8,
  }
];

export const offerCards = [
  {
    title: 'Revamp your workspace',
    type: 'grid',
    items: [
      { name: 'Monitors', image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=300' },
      { name: 'Keyboards', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=300' },
      { name: 'Mice', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=300' },
      { name: 'Chairs', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=300' }
    ],
    linkText: 'See more'
  },
  {
    title: 'Up to 40% off | Laptops & PCs',
    type: 'single',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
    linkText: 'See all offers'
  },
  {
    title: 'Sign in for your best experience',
    type: 'signin'
  },
  {
    title: 'Storage & Networking',
    type: 'grid',
    items: [
      { name: 'Routers', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=300' },
      { name: 'External HDDs', image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=300' },
      { name: 'SSDs', image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=300' },
      { name: 'Switches', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=300' }
    ],
    linkText: 'Explore networking'
  }
];

export const secondaryOfferCards = [
  {
    title: 'Up to 70% off | Clearance store',
    type: 'single',
    image: 'https://images.unsplash.com/photo-1588693892330-01967e8913b5?auto=format&fit=crop&q=80&w=600',
    linkText: 'Shop clearance'
  },
  {
    title: 'Smart Home Devices',
    type: 'grid',
    items: [
      { name: 'Smart Speakers', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=300' },
      { name: 'Security Cameras', image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Smart Bulbs', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Smart Plugs', image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&q=80&w=300' }
    ],
    linkText: 'See all smart home'
  },
  {
    title: 'Starting ₹99 | Cables & Adapters',
    type: 'single',
    image: 'https://images.unsplash.com/photo-1550005973-540ee5b19163?auto=format&fit=crop&q=80&w=600',
    linkText: 'Shop basic accessories'
  },
  {
    title: 'Top brands | Audio & Headphones',
    type: 'grid',
    items: [
      { name: 'Earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=300' },
      { name: 'Headphones', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Speakers', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=300' },
      { name: 'Soundbars', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=300' }
    ],
    linkText: 'Explore audio'
  }
];

export const categories = [
  { name: 'Laptops', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Printers', image: 'https://images.unsplash.com/photo-1588693892330-01967e8913b5?auto=format&fit=crop&q=80&w=400' },
  { name: 'Peripherals', image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=400' },
  { name: 'Networking', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400' }
];
