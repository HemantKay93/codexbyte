import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProductService, Product } from '@byteevolvr/api-client';
import {
  Loader2,
  Zap,
  ArrowRight,
  Gamepad2,
  Flame,
  Tag,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Clock,
  Grid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCartStore } from '@byteevolvr/store';
import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCartStore();
  const currencySymbol = useStoreCurrency();

  const heroSlides = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      badge: 'AVAILABLE NOW',
      title: 'UNLOCK NEXT-GEN PERFORMANCE',
      subtitle:
        'Engineered for precision. Built for power. Experience the zenith of portable gaming with our all-new NEON series laptops.',
      link: '/shop/category/laptops',
      productLink: '/shop/product/1', // Example direct link for technical specs
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      badge: 'NEW ARRIVAL',
      title: 'IMMERSIVE 4K DISPLAYS',
      subtitle:
        'See every detail with crystal clarity. Upgrade your battlestation with our latest ultra-wide curved monitors.',
      link: '/shop/category/monitors',
      productLink: '/shop/product/2',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=2000&auto=format&fit=crop',
      badge: 'CUSTOM BUILDS',
      title: 'BUILD YOUR DREAM RIG',
      subtitle:
        'Custom tailored desktop PCs designed to crush any workload and dominate every game without breaking a sweat.',
      link: '/shop/category/pcs',
      productLink: '/shop/product/3',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slider
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(sliderInterval);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const calculateAvgRating = (product: Product) => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / product.reviews.length;
  };

  const getTags = (product: Product) => (product.tags || []).map((t) => t.toLowerCase());

  // Derive Sections
  const dealOfTheDay = products.filter(
    (p) => getTags(p).includes('deal of the day') || getTags(p).includes('dod')
  );
  const clearanceSale = products.filter((p) => getTags(p).includes('clearance'));
  const newArrivals = products.filter((p) => getTags(p).includes('new'));
  const trending = [...products]
    .sort((a, b) => calculateAvgRating(b) - calculateAvgRating(a))
    .slice(0, 4);

  // Helper component for a product card
  const ProductCard = ({
    product,
    tag,
    tagClass,
    label,
  }: {
    product: Product;
    tag?: string;
    tagClass?: string;
    label?: string;
  }) => {
    const discount =
      product.original_price && product.original_price > product.price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

    return (
      <div className="stitch-glass-panel rounded-2xl p-6 group relative overflow-hidden border-stitch-outline-variant/10 hover:border-stitch-primary/50 transition-all flex flex-col justify-between w-[280px] md:w-[320px] flex-shrink-0 snap-start">
        {tag && (
          <div
            className={`absolute top-4 right-4 ${tagClass || 'bg-stitch-primary text-stitch-on-primary'} font-bold px-3 py-1 rounded text-xs z-10 shadow-lg`}
          >
            {tag}
          </div>
        )}
        {discount > 0 && !tag && (
          <div className="absolute top-4 right-4 bg-stitch-error text-stitch-on-error font-bold px-3 py-1 rounded text-xs z-10 shadow-lg">
            -{discount}% OFF
          </div>
        )}
        <Link
          to={`/shop/product/${product.slug || product.id}`}
          className="block aspect-square bg-white/5 rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4"
        >
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-lg"
            src={product.image_url || 'https://via.placeholder.com/200'}
            alt={product.name}
          />
        </Link>
        <Link to={`/shop/product/${product.slug || product.id}`}>
          <h4 className="font-stitch-headline-lg-mobile uppercase mb-2 text-white line-clamp-2 hover:text-stitch-primary transition-colors">
            {product.name}
          </h4>
        </Link>
        <div className="mt-auto">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-xl font-bold text-stitch-primary">
              {currencySymbol}
              {product.price.toFixed(2)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-stitch-outline line-through text-sm">
                {currencySymbol}
                {product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-full py-3 bg-stitch-primary/10 border border-stitch-primary/30 text-stitch-primary font-bold rounded-lg hover:bg-stitch-primary hover:text-stitch-on-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {label || 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  };

  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 24, seconds: 12 });

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          let { hours, minutes, seconds } = prev;
          if (seconds > 0) {
            seconds--;
          } else {
            seconds = 59;
            if (minutes > 0) {
              minutes--;
            } else {
              minutes = 59;
              hours = Math.max(0, hours - 1);
            }
          }
          return { hours, minutes, seconds };
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-xs text-stitch-error uppercase font-bold tracking-widest flex items-center gap-1.5 bg-stitch-error/10 px-4 py-2 rounded-full border border-stitch-error/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <Clock className="w-4 h-4" /> ENDS IN
        </span>
        <div className="flex items-center gap-2">
          <div className="bg-stitch-surface-container-high border border-stitch-outline-variant/30 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-inner">
            <span className="text-2xl font-black text-white leading-none font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-stitch-outline font-bold tracking-wider mt-1">
              HRS
            </span>
          </div>
          <span className="text-stitch-error font-black text-xl animate-pulse">:</span>
          <div className="bg-stitch-surface-container-high border border-stitch-outline-variant/30 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-inner">
            <span className="text-2xl font-black text-white leading-none font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-stitch-outline font-bold tracking-wider mt-1">
              MIN
            </span>
          </div>
          <span className="text-stitch-error font-black text-xl animate-pulse">:</span>
          <div className="bg-stitch-error/20 border border-stitch-error/40 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            <span className="text-2xl font-black text-stitch-error leading-none font-mono">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-stitch-error font-bold tracking-wider mt-1">SEC</span>
          </div>
        </div>
      </div>
    );
  };

  const ProductSlider = ({
    products,
    tag,
    tagClass,
    label,
  }: {
    products: Product[];
    tag?: string;
    tagClass?: string;
    label?: string;
  }) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (sliderRef && sliderRef.current) {
        const { scrollLeft, clientWidth } = sliderRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <div className="relative group/slider">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 bg-stitch-surface-container-high/90 backdrop-blur-md p-3 rounded-full text-white shadow-xl border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-stitch-primary hover:border-stitch-primary"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={sliderRef as any}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory stitch-no-scrollbar pb-8 pt-4"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              tag={tag}
              tagClass={tagClass}
              label={label}
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 bg-stitch-surface-container-high/90 backdrop-blur-md p-3 rounded-full text-white shadow-xl border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-stitch-primary hover:border-stitch-primary"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full pt-20">
      {' '}
      {/* pt-20 pushes content below the fixed header nav */}
      {/* Announcement Bar */}
      <div className="h-10 bg-gradient-to-r from-stitch-primary/80 to-stitch-secondary/80 text-white flex items-center justify-center text-sm font-medium overflow-hidden z-40 relative">
        <div className="flex items-center gap-2 animate-pulse">
          <Zap className="w-4 h-4 fill-white text-white" />
          <span>Flash Sale: Up to 40% off Gaming Laptops!</span>
        </div>
      </div>
      <main className="w-full">
        {/* Dynamic Hero Slider */}
        <section className="relative h-[650px] w-full mb-stitch-section-gap overflow-hidden bg-stitch-surface">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                className="w-full h-full object-cover brightness-[0.4]"
                src={slide.image}
                alt={slide.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/60 to-transparent"></div>

              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 mb-6 bg-stitch-primary/10 border border-stitch-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-stitch-secondary animate-pulse shadow-[0_0_8px_rgba(173,198,255,0.8)]"></span>
                    <span className="text-stitch-secondary text-xs font-bold uppercase tracking-widest">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white tracking-tight flex items-center gap-4">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-stitch-on-surface-variant mb-10 max-w-2xl leading-relaxed">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={slide.link}
                      className="px-8 py-4 bg-stitch-primary text-stitch-on-primary font-bold rounded-lg hover:bg-stitch-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
                    >
                      Shop Now <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to={slide.productLink}
                      className="px-8 py-4 stitch-glass-panel text-white border border-white/20 font-bold rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Gamepad2 className="w-5 h-5" /> Technical Specs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${idx === currentSlide ? 'w-8 h-2 bg-stitch-primary shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* CMS Image Category Grid */}
        <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto mb-stitch-section-gap">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/shop/category/laptops"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-primary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80"
                alt="Laptops"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Laptops
                </h3>
                <span className="text-xs text-stitch-primary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Browse Systems
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/pcs"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-secondary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80"
                alt="Gaming PCs"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Gaming PCs
                </h3>
                <span className="text-xs text-stitch-secondary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Configure Tower
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/accessories"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-tertiary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80"
                alt="Accessories"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Accessories
                </h3>
                <span className="text-xs text-stitch-tertiary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Level Up Gear
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/monitors"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-primary-fixed-dim/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
                alt="Monitors"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Monitors
                </h3>
                <span className="text-xs text-stitch-primary-fixed-dim font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Ultra-Wide Visuals
                </span>
              </div>
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-stitch-primary" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Deals of the Day */}
            {dealOfTheDay.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-stitch-outline-variant/20 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-white">
                      <Flame className="w-8 h-8 text-stitch-error fill-stitch-error/20" />
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                        DEALS OF THE DAY
                      </h2>
                    </div>
                    <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                      High-performance tech at legendary prices
                    </p>
                  </div>
                  <CountdownTimer />
                </div>

                <ProductSlider products={dealOfTheDay} label="CLAIM DEAL" />
              </section>
            )}

            {/* Clearance Sale */}
            {clearanceSale.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <Tag className="w-8 h-8 text-stitch-tertiary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      CLEARANCE SALE
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Final drops. Unbeatable discounts.
                  </p>
                </div>
                <ProductSlider
                  products={clearanceSale}
                  tag="CLEARANCE"
                  tagClass="bg-stitch-tertiary text-stitch-on-tertiary"
                />
              </section>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <Sparkles className="w-8 h-8 text-stitch-primary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      NEW ARRIVALS
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Fresh tech just dropped.
                  </p>
                </div>
                <ProductSlider
                  products={newArrivals}
                  tag="NEW"
                  tagClass="bg-stitch-primary text-stitch-on-primary"
                />
              </section>
            )}

            {/* Trending Hardware */}
            {trending.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <TrendingUp className="w-8 h-8 text-stitch-secondary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      TRENDING HARDWARE
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Highest rated by the community
                  </p>
                </div>
                <ProductSlider
                  products={trending}
                  tag="TRENDING"
                  tagClass="bg-stitch-secondary text-stitch-on-secondary"
                />
              </section>
            )}
          </div>
        )}

        {/* View All Button */}
        <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap pb-12 flex justify-center">
          <Link
            to="/shop/category/all"
            className="inline-flex items-center gap-3 px-8 py-4 border border-stitch-secondary text-stitch-secondary hover:bg-stitch-secondary hover:text-stitch-on-secondary transition-all font-bold rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(173,198,255,0.1)] hover:shadow-[0_0_25px_rgba(173,198,255,0.3)]"
          >
            <Grid className="w-5 h-5" />
            View All Products
          </Link>
        </section>
      </main>
    </div>
  );
}
