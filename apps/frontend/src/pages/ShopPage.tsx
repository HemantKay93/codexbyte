import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shopProducts, offerCards, secondaryOfferCards } from '../features/shop/data';
import { ShoppingCart, User, ArrowRight, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { useUserStore, useCartStore } from '@byteevolvr/store';
import { Card, Button, Badge } from '@byteevolvr/ui';
import { ProductService, Product } from '@byteevolvr/api-client';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export function ShopPage() {
  const { user } = useUserStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const renderGlassCard = (card: any, index: number) => {
    return (
      <Card
        key={index}
        className="flex flex-col bg-[#070D1A]/80 backdrop-blur-xl border border-white/10 h-[400px] hover:border-accent/50 transition-all duration-300 group overflow-hidden"
      >
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-display font-bold text-white mb-4 leading-tight group-hover:text-accent transition-colors">
            {card.title}
          </h3>

          {card.type === 'signin' ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-accent" />
              </div>
              <p className="text-brand-muted mb-6">
                Unlock exclusive deals and track your orders seamlessly.
              </p>
              <Link to="/shop/login" className="w-full">
                <Button variant="primary" className="w-full">
                  Sign In Securely
                </Button>
              </Link>
            </div>
          ) : card.type === 'single' ? (
            <div className="flex-1 relative rounded-xl overflow-hidden mb-4">
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-transparent opacity-80" />
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
              {card.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden group/item cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-24 object-cover transition-transform duration-300 group-hover/item:scale-110 opacity-80 group-hover/item:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                    <span className="text-xs font-semibold text-white drop-shadow-md">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {card.linkText && (
            <Link
              to="/shop"
              className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all mt-auto"
            >
              {card.linkText} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </Card>
    );
  };

  const renderPremiumCarousel = (title: string, subtitle: string, products: any[]) => {
    return (
      <div className="mb-16">
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h3 className="text-3xl font-display font-bold text-white mb-2">{title}</h3>
            <p className="text-brand-muted">{subtitle}</p>
          </div>
          <Button variant="ghost" className="text-accent hover:text-white group">
            View All{' '}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide snap-x px-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] max-w-[280px] snap-start"
              onClick={() => navigate(`/shop/product/${product.id}`)}
            >
              <Card className="h-full bg-[#070D1A] border-white/5 hover:border-accent/30 transition-all duration-300 cursor-pointer overflow-hidden p-0 group">
                <div className="relative h-[220px] bg-white/5 overflow-hidden p-6 flex items-center justify-center">
                  <div className="absolute top-3 left-3 z-10">
                    <Badge
                      variant="primary"
                      className="bg-accent/20 text-accent border-accent/20 backdrop-blur-md"
                    >
                      Hot Deal
                    </Badge>
                  </div>
                  <img
                    src={product.image_url || product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {product.brand}
                  </div>
                  <h4 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                    {product.name}
                  </h4>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(Number(product.price))}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-white/40 line-through">
                          {formatPrice(Number(product.original_price))}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      size="sm"
                      variant="primary"
                      className="rounded-lg h-10 w-10 p-0 flex items-center justify-center shadow-lg shadow-accent/20"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#04080F] text-white selection:bg-accent/30">
      <main className="relative mx-auto pb-20">
        {/* Modern Hero Section */}
        <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
          <div className="absolute inset-0 bg-[#04080F]" />

          {/* Abstract Tech Background */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <img
              src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=2000"
              alt="Tech Background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gradients to blend smoothly */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#04080F] via-[#04080F]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080F] via-[#04080F]/20 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-[1500px] mx-auto px-6 pt-32 md:pt-40">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6 backdrop-blur-md">
                <Zap className="h-4 w-4 fill-current" /> Next-Gen Hardware
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                Elevate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">
                  Digital Realm
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
                Discover enterprise-grade workstations, immersive displays, and ultra-fast
                networking gear curated for professionals.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-xl px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Explore Catalog
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-xl px-8 border border-white/20 hover:bg-white/5"
                >
                  View Deals
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="relative z-20 max-w-[1500px] mx-auto px-6 -mt-16 md:-mt-24 mb-16 hidden md:block">
          <div className="bg-[#070D1A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex justify-around shadow-2xl">
            {[
              { title: 'Secure Checkout', desc: 'Enterprise-grade encryption', icon: ShieldCheck },
              { title: 'Express Delivery', desc: 'Next day shipping on prime', icon: Zap },
              { title: 'Premium Support', desc: '24/7 dedicated experts', icon: User },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-white">{feature.title}</div>
                  <div className="text-sm text-white/50">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-[1500px] mx-auto px-6">
          {/* Reference Layout: 4-Column Grid of Categories/Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 md:-mt-10 lg:-mt-10">
            {offerCards.map((card, i) => renderGlassCard(card, i))}
          </div>

          {/* Reference Layout: Horizontal Product Carousel */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-accent" />
            </div>
          ) : products.length > 0 ? (
            renderPremiumCarousel(
              'Flash Sale: Flagship Tech',
              'Limited quantities available. Up to 40% off retail price.',
              products
            )
          ) : (
            <div className="text-center py-20 bg-[#070D1A] border border-white/10 rounded-2xl mb-20">
              <h3 className="text-xl font-bold mb-2">No Products Available</h3>
              <p className="text-brand-muted">
                Please add products via the Admin panel or run your database migrations.
              </p>
            </div>
          )}

          {/* Reference Layout: Secondary 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {secondaryOfferCards.map((card, i) => renderGlassCard(card, i))}
          </div>

          {/* Reference Layout: Second Horizontal Carousel */}
          {!loading &&
            products.length > 0 &&
            renderPremiumCarousel(
              'Curated for Creatives',
              'High-color accuracy displays and responsive peripherals.',
              [...products].reverse()
            )}
        </div>
      </main>
    </div>
  );
}
