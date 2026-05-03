import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Badge, Card, Spinner } from '@byteevolvr/ui';
import { PageSeo } from '@/components/PageSeo';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hero, setHero] = useState<any>({ title: 'Technology Products', subtitle: 'Premium hardware and peripherals for modern professionals and enterprise teams.' });

  useEffect(() => {
    fetchProducts();
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const { data } = await supabase
        .from('cms_content')
        .select('content')
        .eq('page_slug', 'home')
        .eq('section_key', 'hero')
        .single();
      if (data) setHero(data.content);
    } catch (err) {
      console.error('Error fetching hero:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  return (
    <main style={{ padding: 'var(--space-12) var(--space-8) var(--space-16)' }}>
      <PageSeo 
        title="Premium Technology Products" 
        description="Browse our curated collection of enterprise-grade laptops, printers, and peripherals for modern professionals."
      />
      <section style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ 
          marginBottom: 'var(--space-12)', 
          padding: 'var(--space-16) 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Badge variant="primary" style={{ marginBottom: 'var(--space-4)' }}>Premium Catalog</Badge>
            <h1 style={{ 
              fontSize: 64, 
              lineHeight: 1.1, 
              margin: '0 0 var(--space-4)', 
              fontWeight: 800,
              background: 'linear-gradient(to right, #fff 30%, #8B9BB8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em'
            }}>
              {hero.title}
            </h1>
            <p style={{ maxWidth: 640, color: 'var(--color-text-muted)', fontSize: 20, lineHeight: 1.6 }}>
              {hero.subtitle}
            </p>
          </div>
          
          {/* Subtle Background Glow */}
          <div style={{ 
            position: 'absolute', 
            top: -100, 
            right: -100, 
            width: 400, 
            height: 400, 
            background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.15) 0%, transparent 70%)', 
            zIndex: 0 
          }} />
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 400px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 1 }}>
                <Search size={18} />
              </div>
              <Input
                placeholder="Search premium technology products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 44, height: 52, borderRadius: 12, border: '1px solid var(--color-border-subtle)', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ padding: '8px 12px', borderRadius: 8, background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '8px 12px', borderRadius: 8, background: viewMode === 'list' ? 'var(--color-primary)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                style={{ borderRadius: 100, padding: '8px 24px', whiteSpace: 'nowrap', border: selectedCategory === cat ? 'none' : '1px solid var(--color-border-subtle)' }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
            <Spinner size="lg" />
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
            No products found matching your criteria.
          </div>
        ) : (
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', 
            gap: 'var(--space-8)' 
          }}>
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                padding={false} 
                style={{ 
                  display: 'flex', 
                  flexDirection: viewMode === 'grid' ? 'column' : 'row',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--color-border-subtle)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  width: viewMode === 'grid' ? '100%' : '300px',
                  height: viewMode === 'grid' ? 240 : 'auto',
                  flexShrink: 0
                }}>
                  <img
                    src={product.image_url || product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <Badge variant={product.stock_quantity > 0 ? 'success' : 'error'}>
                      {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
                <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.brand} · {product.category}
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 var(--space-3)', color: '#fff' }}>{product.name}</h2>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: 15, marginBottom: 'var(--space-4)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                  
                  <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {product.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" size="sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>{tag}</Badge>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{formatPrice(product.price)}</div>
                      {product.original_price && (
                        <div style={{ color: 'var(--color-text-subtle)', textDecoration: 'line-through', fontSize: 13, marginTop: 2 }}>
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="primary" style={{ padding: '10px 24px', borderRadius: 10 }}>View Details</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
