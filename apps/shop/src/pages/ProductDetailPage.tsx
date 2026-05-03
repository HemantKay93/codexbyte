import { addToCart } from '@byteevolvr/store';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/hooks/useStoreHooks';
import { Button, Badge, Card, Spinner } from '@byteevolvr/ui';
import { PageSeo } from '@/components/PageSeo';
import { ArrowLeft, ShoppingCart, Zap, Star, ShieldCheck, Truck, RefreshCw, Heart, MessageSquare } from 'lucide-react';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const FAQS = [
  { question: 'What is the warranty period?', answer: 'All enterprise products come with a standard 1-year manufacturer warranty, with optional extensions available.' },
  { question: 'Is same-day delivery available?', answer: 'Same-day delivery is available for metro cities in India if ordered before 11 AM.' },
  { question: 'Do you provide on-site installation?', answer: 'Yes, on-site installation and configuration are provided for enterprise hardware in Tier-1 cities.' },
];

// REVIEWS mock removed for real data

export function ProductDetailPage() {
  const { slug } = useParams(); // This is actually the ID now
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('specs');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
      fetchReviews(slug);
      checkWishlist(slug);
    }
  }, [slug]);

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*, user_profiles(name)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const checkWishlist = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    setIsWishlisted(!!data);
  };

  const toggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    if (isWishlisted) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      setIsWishlisted(false);
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      setIsWishlisted(true);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('product_reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewComment,
        status: 'pending'
      });
      if (error) throw error;
      setReviewComment('');
      alert('Review submitted for approval!');
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchProduct = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      setMainImage(data.image_url || data.imageUrl);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!product) return;
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        imageUrl: product.image_url || product.imageUrl,
      })
    );
  };

  const buyNow = () => {
    addItem();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading product details...</p>
      </div>
    );
  }

  return (
    <main style={{ padding: 'var(--space-12) var(--space-8) var(--space-16)' }}>
      <PageSeo 
        title={product.name} 
        description={product.description}
        ogImage={product.imageUrl}
        ogType="product"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": [product.imageUrl],
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": product.brand
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        })}
      </script>
      <section style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
          <div>
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '4/3',
                borderRadius: 24, 
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}>
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }} 
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: 'var(--space-3)', 
                  marginTop: 'var(--space-4)' 
                }}>
                  {product.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setMainImage(img)}
                      style={{ 
                        aspectRatio: '1/1',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: mainImage === img ? '2px solid var(--color-primary)' : '1px solid var(--color-border-subtle)',
                        padding: 0,
                        cursor: 'pointer',
                        background: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Badge variant="primary">{product.brand}</Badge>
                <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 'var(--space-3) 0' }}>{product.name}</h1>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div style={{ color: '#FBBF24', display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ opacity: i < Math.floor(product.rating || 0) ? 1 : 0.3 }}>★</span>
                    ))}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 14, marginLeft: 8 }}>({product.rating || 0}/5)</span>
                  </div>
                  <Badge variant={product.stock_quantity > 0 || product.stockQuantity > 0 ? 'success' : 'error'}>
                    {product.stock_quantity > 0 || product.stockQuantity > 0 ? `${product.stock_quantity || product.stockQuantity} in stock` : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
              <button 
                onClick={toggleWishlist}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--color-border-subtle)', 
                  borderRadius: '50%', 
                  padding: 12, 
                  cursor: 'pointer',
                  color: isWishlisted ? '#ef4444' : '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <Heart fill={isWishlisted ? '#ef4444' : 'none'} size={24} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1.7, marginTop: 'var(--space-6)' }}>
              {product.description}
            </p>

            {product.variants && (
              <div style={{ marginTop: 'var(--space-8)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: 12 }}>Available Variants</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.variants.map((v: string) => (
                    <button key={v} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: '#fff', fontSize: 14 }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ margin: 'var(--space-10) 0' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#fff' }}>{formatPrice(product.price)}</div>
              <div style={{ color: 'var(--color-text-subtle)', textDecoration: 'line-through', fontSize: 18 }}>
                {formatPrice(product.originalPrice)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
              <Button onClick={addItem} variant="secondary" size="lg" style={{ flex: 1 }}>Add to Cart</Button>
              <Button onClick={buyNow} variant="primary" size="lg" style={{ flex: 1 }}>Buy Now</Button>
            </div>

            <div style={{ marginTop: 'var(--space-12)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-8)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                {['Specs', 'Reviews', 'Shipping'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeTab === tab.toLowerCase() ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--color-accent)' : 'none',
                      paddingBottom: 4,
                      fontSize: 16
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'specs' && (
                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Manufacturer</span>
                    <span style={{ fontWeight: 500 }}>{product.manufacturer}</span>
                  </div>
                  {Object.entries(product.specs || {}).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                  <Card style={{ padding: 'var(--space-5)', border: '1px solid var(--color-primary-subtle)' }}>
                    <h3 style={{ fontSize: 18, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={20} /> Write a Review
                    </h3>
                    <form onSubmit={submitReview}>
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: 'var(--color-text-muted)' }}>Rating</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              type="button"
                              onClick={() => setReviewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star fill={star <= reviewRating ? '#FBBF24' : 'none'} color={star <= reviewRating ? '#FBBF24' : 'var(--color-text-muted)'} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <textarea 
                          placeholder="Share your experience with this product..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{ 
                            width: '100%', 
                            minHeight: 100, 
                            padding: 12, 
                            borderRadius: 12, 
                            background: 'rgba(255,255,255,0.02)', 
                            border: '1px solid var(--color-border)',
                            color: '#fff',
                            fontFamily: 'inherit'
                          }}
                          required
                        />
                      </div>
                      <Button type="submit" variant="primary" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  </Card>

                  <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {reviews.length === 0 ? (
                      <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map(review => (
                        <Card key={review.id} style={{ padding: 'var(--space-4)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>{review.user_profiles?.name || 'Anonymous'}</span>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ color: '#FBBF24', marginBottom: 8 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} style={{ opacity: i < review.rating ? 1 : 0.2 }}>★</span>
                            ))}
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{review.comment}</p>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                  Free express shipping across India for all enterprise orders. Estimated delivery: 2-4 business days.
                </div>
              )}
            </div>
          </div>
        </div>

        <section style={{ marginTop: 'var(--space-16)' }}>
          <h2 style={{ fontSize: 32, marginBottom: 'var(--space-8)' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {FAQS.map((faq, i) => (
              <Card key={i} style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 18, marginBottom: 'var(--space-2)' }}>{faq.question}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
