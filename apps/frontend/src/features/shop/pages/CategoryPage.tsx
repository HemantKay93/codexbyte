import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService, Product } from '@byteevolvr/api-client';
import { useCartStore } from '@byteevolvr/store';
import {
  Loader2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  Star,
  Plus,
  Check,
} from 'lucide-react';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';
export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const currencySymbol = useStoreCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch products; ideally filter by category (id)
        const data = await ProductService.getProducts();
        // Since we don't have categories in dummy API, let's just use all
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.body.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, rgba(173, 198, 255, 0.05) 0%, transparent 50%)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex w-full">
      {/* Sidebar (Desktop Filters) */}
      <aside className="hidden md:block sticky top-0 left-0 w-80 h-screen pt-24 pb-8 border-r border-stitch-outline-variant/30 bg-stitch-surface/80 backdrop-blur-xl px-8 overflow-y-auto stitch-no-scrollbar">
        <h2 className="font-stitch-headline-lg text-stitch-headline-lg-mobile uppercase text-stitch-primary mb-8">
          Filters
        </h2>
        <div className="space-y-10">
          <section>
            <h3 className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase mb-4">
              Brand
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-stitch-outline-variant bg-stitch-surface-container-high flex items-center justify-center group-hover:border-stitch-primary transition-colors">
                  {/* Unchecked state */}
                </div>
                <span className="group-hover:text-stitch-primary text-stitch-on-surface-variant transition-colors">
                  Logitech G
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded bg-stitch-primary flex items-center justify-center shadow-[0_0_10px_rgba(77,142,255,0.3)]">
                  <Check className="w-3 h-3 text-stitch-on-primary" strokeWidth={3} />
                </div>
                <span className="text-white font-medium transition-colors">Razer</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-stitch-outline-variant bg-stitch-surface-container-high flex items-center justify-center group-hover:border-stitch-primary transition-colors"></div>
                <span className="group-hover:text-stitch-primary text-stitch-on-surface-variant transition-colors">
                  Corsair
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-stitch-outline-variant bg-stitch-surface-container-high flex items-center justify-center group-hover:border-stitch-primary transition-colors"></div>
                <span className="group-hover:text-stitch-primary text-stitch-on-surface-variant transition-colors">
                  HyperX
                </span>
              </label>
            </div>
          </section>

          <section>
            <h3 className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline uppercase mb-4">
              Price Range
            </h3>
            <div className="relative pt-4 pb-2">
              <div className="h-1.5 w-full bg-stitch-outline-variant/50 rounded-full overflow-hidden">
                <div className="h-full bg-stitch-primary w-[60%] absolute left-[20%] rounded-full shadow-[0_0_10px_rgba(77,142,255,0.5)]"></div>
              </div>
              <div className="absolute top-2.5 left-[20%] w-4 h-4 bg-white rounded-full border-2 border-stitch-primary shadow-lg cursor-pointer transform -translate-x-1/2 hover:scale-110 transition-transform"></div>
              <div className="absolute top-2.5 left-[80%] w-4 h-4 bg-white rounded-full border-2 border-stitch-primary shadow-lg cursor-pointer transform -translate-x-1/2 hover:scale-110 transition-transform"></div>
            </div>
            <div className="flex justify-between mt-3 font-stitch-label-sm text-stitch-label-sm text-stitch-outline">
              <span className="bg-stitch-surface-container-high px-2 py-1 rounded">
                {currencySymbol}49
              </span>
              <span className="bg-stitch-surface-container-high px-2 py-1 rounded">
                {currencySymbol}499
              </span>
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-24 pb-20 px-stitch-container-padding-mobile md:px-8 min-h-screen w-full">
        {/* Toolbar */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-stitch-outline-variant/20 pb-6">
          <div>
            <h1 className="font-stitch-headline-lg text-stitch-headline-lg text-white capitalize mb-2">
              {id || 'Premium Selection'}
            </h1>
            <p className="text-stitch-primary font-stitch-label-sm tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stitch-primary animate-pulse"></span>
              Displaying {products.length} items
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-stitch-surface-container p-1 rounded-xl border border-stitch-outline-variant/30">
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-stitch-primary/20 text-stitch-primary shadow-[0_0_15px_rgba(77,142,255,0.15)]' : 'hover:bg-stitch-surface-variant text-stitch-outline'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-stitch-primary/20 text-stitch-primary shadow-[0_0_15px_rgba(77,142,255,0.15)]' : 'hover:bg-stitch-surface-variant text-stitch-outline'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button className="md:hidden flex items-center justify-center gap-2 bg-stitch-primary text-stitch-on-primary px-6 py-3 rounded-xl font-stitch-cta-button w-full shadow-[0_0_20px_rgba(77,142,255,0.3)]">
              <SlidersHorizontal className="w-5 h-5" />
              Sort &amp; Filter
            </button>
            <div className="hidden md:block relative group">
              <select className="appearance-none bg-stitch-surface-container-high border border-stitch-outline-variant/30 rounded-xl px-6 py-3 pr-12 text-white focus:ring-2 focus:ring-stitch-primary focus:border-transparent outline-none font-stitch-cta-button cursor-pointer group-hover:border-stitch-primary/50 transition-colors">
                <option>Sort: Best Match</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stitch-primary" />
            </div>
          </div>
        </header>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-stitch-primary" />
          </div>
        ) : (
          <div
            className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-stitch-gutter' : 'grid-cols-1 max-w-3xl mx-auto gap-stitch-gutter'} transition-all duration-500`}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="stitch-glass-panel rounded-2xl p-4 transition-all duration-300 group flex flex-col hover:border-stitch-secondary/50"
              >
                <Link
                  to={`/shop/product/${product.slug || product.id}`}
                  className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-stitch-surface-container-high block group/image"
                >
                  <img
                    src={product.image_url || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110 opacity-90 group-hover/image:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stitch-surface/80 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Wishlist functionality could go here
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-stitch-surface/80 backdrop-blur-xl rounded-full text-stitch-outline hover:text-stitch-error hover:bg-white transition-all transform hover:scale-110 shadow-lg"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </Link>
                <div className="flex-grow">
                  <div className="flex items-center gap-1 text-stitch-secondary mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-stitch-label-sm font-bold text-white">5.0</span>
                    <span className="text-stitch-outline font-normal">
                      ({product.reviews?.length || 0})
                    </span>
                  </div>
                  <Link to={`/shop/product/${product.slug || product.id}`}>
                    <h3 className="font-stitch-headline-lg-mobile text-white mb-2 group-hover:text-stitch-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-stitch-outline text-stitch-label-sm mb-4 line-clamp-1">
                    {product.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-stitch-headline-lg-mobile text-stitch-primary">
                        {currencySymbol}
                        {product.price.toFixed(2)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-stitch-outline line-through text-stitch-label-sm">
                          {currencySymbol}
                          {product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-stitch-outline-variant/20">
                  <label className="flex items-center gap-2 cursor-pointer group/comp">
                    <div className="w-4 h-4 rounded border border-stitch-outline-variant bg-stitch-surface-container-high flex items-center justify-center group-hover/comp:border-stitch-primary transition-colors"></div>
                    <span className="text-stitch-label-sm text-stitch-outline group-hover/comp:text-white transition-colors">
                      Compare
                    </span>
                  </label>
                  <button
                    onClick={() => addItem(product)}
                    className="bg-stitch-primary/10 text-stitch-primary border border-stitch-primary/50 px-4 py-2 rounded-lg font-stitch-cta-button hover:bg-stitch-primary hover:text-stitch-on-primary active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    ADD
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
