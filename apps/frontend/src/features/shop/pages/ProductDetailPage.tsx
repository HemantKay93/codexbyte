import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductService, Product } from '@byteevolvr/api-client';
import { useCartStore } from '@byteevolvr/store';
import { Loader2, ZoomIn, Star, Cpu, Monitor, Zap, ChevronDown, Plus } from 'lucide-react';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';
export function ProductDetailPage() {
  // eslint-disable-line complexity
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const currencySymbol = useStoreCurrency();

  const [activeTab, setActiveTab] = useState('description');
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [selectedRam, setSelectedRam] = useState(16);
  const [selectedStorage, setSelectedStorage] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await ProductService.getProduct(id);
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-line @typescript-eslint/no-floating-promises
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      setAdding(true);
      addItem(product);
      setTimeout(() => setAdding(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-stitch-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-stitch-on-surface-variant">
          The product you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <main className="pt-24 pb-32 w-full">
        <div className="max-w-7xl mx-auto px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop grid grid-cols-1 lg:grid-cols-2 gap-stitch-gutter lg:gap-16">
          {/* Image Gallery Section */}
          <section className="space-y-6">
            <div className="relative group aspect-video md:aspect-square overflow-hidden rounded-xl stitch-glass-panel flex items-center justify-center bg-stitch-surface-container/20">
              <img
                className="w-full h-full object-cover p-4 transform transition-transform duration-700 group-hover:scale-110"
                src={product.image_url || 'https://via.placeholder.com/150'}
                alt={product.name}
                loading="lazy"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-stitch-primary shadow-[0_0_10px_rgba(93,230,255,0.4)]"></div>
                <div className="w-2 h-2 rounded-full bg-stitch-outline-variant"></div>
                <div className="w-2 h-2 rounded-full bg-stitch-outline-variant"></div>
              </div>
              <ZoomIn className="w-4 h-4" />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 stitch-no-scrollbar">
              <button className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-stitch-primary overflow-hidden bg-stitch-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src={product.image_url || 'https://via.placeholder.com/150'}
                  alt="Thumbnail 1"
                />
              </button>
              <button className="flex-shrink-0 w-24 h-24 rounded-lg border border-stitch-outline-variant overflow-hidden bg-stitch-surface-container opacity-60 hover:opacity-100 transition-opacity">
                <img
                  className="w-full h-full object-cover grayscale opacity-50"
                  src={product.image_url || 'https://via.placeholder.com/150'}
                  alt="Thumbnail 2"
                />
              </button>
            </div>
          </section>

          {/* Product Details Section */}
          <section className="flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-stitch-secondary-container/20 text-stitch-secondary-fixed-dim px-3 py-1 rounded-full font-stitch-label-sm text-stitch-label-sm flex items-center gap-1 border border-stitch-secondary/30">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-stitch-secondary animate-pulse"
                    style={{ animationDuration: '2s' }}
                  ></span>
                  In Stock - Fast Shipping
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                  <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface">
                    5.0 ({product.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
              <h1 className="font-stitch-display-lg text-stitch-display-lg-mobile md:text-stitch-headline-lg tracking-tight text-white uppercase">
                {product.name}
              </h1>
              <p className="font-stitch-headline-lg text-stitch-primary">
                {currencySymbol}
                {product.price.toFixed(2)}
              </p>
            </div>

            {/* Key Features Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="stitch-glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
                <Cpu className="w-5 h-5 text-stitch-primary" />
                <span className="font-stitch-label-sm text-stitch-label-sm">NVIDIA RTX 4080</span>
              </div>
              <div className="stitch-glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
                <Monitor className="w-5 h-5 text-stitch-primary" />
                <span className="font-stitch-label-sm text-stitch-label-sm">144Hz Display</span>
              </div>
              <div className="stitch-glass-panel px-4 py-3 rounded-xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-stitch-primary" />
                <span className="font-stitch-label-sm text-stitch-label-sm">
                  Ultra-Slim Chassis
                </span>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="font-stitch-label-sm text-stitch-label-sm uppercase text-stitch-outline">
                  System Memory (RAM)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedRam(16)}
                    className={`stitch-glass-panel py-4 rounded-xl transition-all ${selectedRam === 16 ? 'border-2 border-stitch-primary shadow-[0_0_10px_rgba(93,230,255,0.4)]' : 'border border-stitch-outline-variant hover:border-stitch-primary'}`}
                  >
                    <span
                      className={`block font-bold ${selectedRam === 16 ? 'text-white' : 'text-stitch-on-surface-variant'}`}
                    >
                      16GB DDR5
                    </span>
                    <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline">
                      Included
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedRam(32)}
                    className={`stitch-glass-panel py-4 rounded-xl transition-all ${selectedRam === 32 ? 'border-2 border-stitch-primary shadow-[0_0_10px_rgba(93,230,255,0.4)]' : 'border border-stitch-outline-variant hover:border-stitch-primary'}`}
                  >
                    <span
                      className={`block font-bold ${selectedRam === 32 ? 'text-white' : 'text-stitch-on-surface-variant'}`}
                    >
                      32GB DDR5
                    </span>
                    <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline">
                      +{currencySymbol}199.00
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-stitch-label-sm text-stitch-label-sm uppercase text-stitch-outline">
                  Storage Capacity
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedStorage(1)}
                    className={`stitch-glass-panel py-4 rounded-xl transition-all ${selectedStorage === 1 ? 'border-2 border-stitch-primary shadow-[0_0_10px_rgba(93,230,255,0.4)]' : 'border border-stitch-outline-variant hover:border-stitch-primary'}`}
                  >
                    <span
                      className={`block font-bold ${selectedStorage === 1 ? 'text-white' : 'text-stitch-on-surface-variant'}`}
                    >
                      1TB NVMe Gen4
                    </span>
                    <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline">
                      Included
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedStorage(2)}
                    className={`stitch-glass-panel py-4 rounded-xl transition-all ${selectedStorage === 2 ? 'border-2 border-stitch-primary shadow-[0_0_10px_rgba(93,230,255,0.4)]' : 'border border-stitch-outline-variant hover:border-stitch-primary'}`}
                  >
                    <span
                      className={`block font-bold ${selectedStorage === 2 ? 'text-white' : 'text-stitch-on-surface-variant'}`}
                    >
                      2TB NVMe Gen4
                    </span>
                    <span className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline">
                      +{currencySymbol}249.00
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabbed Info Section */}
            <div className="space-y-6 pt-4">
              <div className="border-b border-stitch-outline-variant/20">
                <div className="flex gap-8 overflow-x-auto stitch-no-scrollbar scroll-smooth">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-4 font-stitch-label-sm text-stitch-label-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'description' ? 'text-stitch-primary border-stitch-primary' : 'text-stitch-on-surface-variant border-transparent hover:text-stitch-primary'}`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`pb-4 font-stitch-label-sm text-stitch-label-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'specifications' ? 'text-stitch-primary border-stitch-primary' : 'text-stitch-on-surface-variant border-transparent hover:text-stitch-primary'}`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 font-stitch-label-sm text-stitch-label-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'reviews' ? 'text-stitch-primary border-stitch-primary' : 'text-stitch-on-surface-variant border-transparent hover:text-stitch-primary'}`}
                  >
                    Reviews ({product.reviews?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`pb-4 font-stitch-label-sm text-stitch-label-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'faq' ? 'text-stitch-primary border-stitch-primary' : 'text-stitch-on-surface-variant border-transparent hover:text-stitch-primary'}`}
                  >
                    FAQ
                  </button>
                </div>
              </div>

              {activeTab === 'description' && (
                <div>
                  <div
                    className={`relative overflow-hidden transition-all duration-500 ${showFullDesc ? 'max-h-[1000px]' : 'max-h-24'}`}
                  >
                    <p className="text-stitch-on-surface-variant leading-relaxed">
                      {product.description}
                    </p>
                    {!showFullDesc && (
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-stitch-background to-transparent"></div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-4 flex items-center gap-2 text-stitch-primary font-stitch-label-sm hover:gap-3 transition-all"
                  >
                    <span>{showFullDesc ? 'SHOW LESS' : 'READ MORE'}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${showFullDesc ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="font-stitch-label-sm text-stitch-outline text-[10px] uppercase mb-1">
                      Category
                    </p>
                    <p className="text-white capitalize">{product.category}</p>
                  </div>
                  <div>
                    <p className="font-stitch-label-sm text-stitch-outline text-[10px] uppercase mb-1">
                      Inventory
                    </p>
                    <p className="text-white">Available</p>
                  </div>
                  <div>
                    <p className="font-stitch-label-sm text-stitch-outline text-[10px] uppercase mb-1">
                      Display
                    </p>
                    <p className="text-white">15.6" QHD 144Hz G-Sync</p>
                  </div>
                  <div>
                    <p className="font-stitch-label-sm text-stitch-outline text-[10px] uppercase mb-1">
                      Battery
                    </p>
                    <p className="text-white">99.9 Whr Lithium-ion</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold">Top Verified Reviews</p>
                    <button className="text-stitch-primary text-xs font-stitch-label-sm underline">
                      View all {product.reviews?.length || 0} reviews
                    </button>
                  </div>
                  <div className="p-4 stitch-glass-panel rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-stitch-secondary scale-75">
                        <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                        <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                        <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                        <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                        <Star className="w-4 h-4 text-stitch-secondary fill-stitch-secondary" />
                      </div>
                      <span className="text-sm font-bold text-white">Alex M.</span>
                    </div>
                    <p className="text-sm text-stitch-on-surface-variant italic">
                      "This machine is a beast. Thermal management is surprisingly good given the
                      slim profile."
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="p-4 stitch-glass-panel rounded-xl border-l-2 border-stitch-primary">
                    <p className="font-bold text-sm mb-1 text-white">
                      What is the warranty period?
                    </p>
                    <p className="text-sm text-stitch-outline">
                      Every device comes with a 2-year precision warranty.
                    </p>
                  </div>
                  <div className="p-4 stitch-glass-panel rounded-xl">
                    <p className="font-bold text-sm mb-1 text-white">
                      Can I upgrade the RAM later?
                    </p>
                    <p className="text-sm text-stitch-outline">
                      Yes, features two user-accessible DDR5 slots.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Frequently Bought Together Section */}
        <section className="max-w-7xl mx-auto px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mt-stitch-section-gap">
          <h2 className="font-stitch-headline-lg mb-8 text-white">Frequently Bought Together</h2>
          <div className="stitch-glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-stitch-surface-container flex items-center justify-center p-2">
                <img
                  className="w-full h-full object-cover rounded-lg"
                  src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=200&auto=format&fit=crop"
                  alt="Keyboard"
                />
              </div>
              <Plus className="w-6 h-6 text-stitch-outline" />
              <div className="w-24 h-24 rounded-xl bg-stitch-surface-container flex items-center justify-center p-2">
                <img
                  className="w-full h-full object-cover rounded-lg"
                  src="https://images.unsplash.com/photo-1615663245857-ac1eeb5366b4?q=80&w=200&auto=format&fit=crop"
                  alt="Mouse"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-stitch-headline-lg-mobile text-white">Upgrade your setup</h3>
              <p className="text-stitch-outline">
                Add the Precision Mouse &amp; Mechanical Keyboard to your order.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="font-stitch-headline-lg text-stitch-secondary">+$348.00</p>
              <button
                onClick={handleAddToCart}
                className="bg-stitch-primary text-stitch-on-primary px-8 py-3 rounded-full font-stitch-cta-button hover:brightness-110 transition-all scale-95 active:scale-90"
              >
                Add Bundle
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-[60] bg-stitch-surface-container/80 backdrop-blur-2xl border-t border-white/10 h-20 shadow-[0_-15px_40px_-10px_rgba(0,0,0,0.8)] flex items-center justify-between px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop">
        <div className="hidden md:flex flex-col">
          <span className="font-stitch-label-sm text-stitch-outline text-[10px] uppercase">
            Current Config
          </span>
          <span className="font-bold text-white">
            {product.name} — {selectedRam}GB / {selectedStorage}TB
          </span>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={handleAddToCart}
            className={`flex-1 md:w-48 py-3 rounded-full border ${adding ? 'bg-stitch-primary/30 border-stitch-primary text-white' : 'border-stitch-primary text-stitch-primary'} font-stitch-cta-button hover:bg-stitch-primary/10 transition-all scale-95 active:scale-90`}
          >
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
          <button
            onClick={() => {
              handleAddToCart();
              window.location.href = '/shop/checkout';
            }}
            className="flex-1 md:w-48 py-3 rounded-full bg-stitch-primary text-stitch-on-primary font-stitch-cta-button hover:brightness-110 shadow-lg shadow-stitch-primary/20 transition-all scale-95 active:scale-90"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
