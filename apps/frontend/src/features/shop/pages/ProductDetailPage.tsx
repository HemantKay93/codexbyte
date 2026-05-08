import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService, Product } from '@byteevolvr/api-client';
import { Loader2, ArrowLeft, ShoppingCart, Truck, ShieldCheck, Star } from 'lucide-react';
import { Button, Badge } from '@byteevolvr/ui';
import { useUserStore, useCartStore } from '@byteevolvr/store';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { addItem: addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'description' | 'specifications' | 'qna' | 'reviews' | 'tags'
  >('description');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await ProductService.getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setAddingToCart(false);
    }, 400);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/shop/checkout'); // Placeholder
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#04080F]">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#04080F] text-white">
        <h2 className="text-2xl font-bold mb-4">{error || 'Product Not Found'}</h2>
        <Button onClick={() => navigate('/shop')} variant="secondary">
          Return to Shop
        </Button>
      </div>
    );
  }

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#04080F] text-white pt-32 pb-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-sm text-brand-muted hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Image */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center relative overflow-hidden group">
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    variant="error"
                    className="text-xs bg-red-500/20 text-red-400 border-red-500/20"
                  >
                    {discount}% OFF
                  </Badge>
                </div>
              )}
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-32 h-32 bg-white/10 rounded-xl" />
              )}
            </div>

            {/* Small image gallery placeholder */}
            {product.image_url && (
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-20 h-20 rounded-xl border ${i === 1 ? 'border-accent' : 'border-white/10'} bg-white/5 p-2 cursor-pointer hover:border-white/30 transition-colors`}
                  >
                    <img
                      src={product.image_url}
                      className="w-full h-full object-contain opacity-70"
                      alt={`View ${i}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <div className="mb-6 border-b border-white/10 pb-6">
              <div className="text-accent text-sm font-bold tracking-wider uppercase mb-2">
                {product.brand || product.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-brand-muted mb-4">
                <span className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current mr-1" /> 4.8 (124 reviews)
                </span>
                <span>•</span>
                <span>SKU: {product.sku || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-white">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-brand-muted line-through mb-1">
                    ₹{Number(product.original_price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-400 font-medium mb-1">Inclusive of all taxes</p>
            </div>

            <div className="prose prose-invert max-w-none text-brand-muted mb-8 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Actions */}
            <div className="bg-[#070D1A] rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>

                {product.stock_quantity > 0 && (
                  <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-[#04080F]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-white hover:bg-white/5 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-bold text-white border-x border-white/20 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 py-2 text-white hover:bg-white/5 transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || addingToCart}
                  variant="secondary"
                  className="w-full py-4 rounded-xl border border-white/20 bg-transparent hover:bg-white/5 flex justify-center items-center gap-2"
                >
                  {addingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                  variant="primary"
                  className="w-full py-4 rounded-xl shadow-[0_0_15px_rgba(26,79,214,0.3)]"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-4 text-sm text-brand-muted">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <Truck className="h-5 w-5 text-accent" />
                <span>Free delivery across India</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span>1 Year Brand Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs Section */}
        <div className="mt-20 border-t border-white/10 pt-10">
          <div className="flex flex-wrap gap-8 border-b border-white/10 mb-8">
            {(['description', 'specifications', 'qna', 'reviews', 'tags'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                {tab === 'qna' ? 'Q & A' : tab}
                {tab === 'reviews' && product.reviews && ` (${product.reviews.length})`}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none text-brand-muted leading-relaxed">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-3xl">
                {product.specifications && product.specifications.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="border-b border-white/10">
                          <th className="py-4 font-medium text-brand-subtle w-1/3">{spec.key}</th>
                          <td className="py-4 text-white">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-brand-muted">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'qna' && (
              <div className="max-w-3xl space-y-6">
                {product.qna && product.qna.length > 0 ? (
                  product.qna.map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/5">
                      <h4 className="font-bold text-white mb-2 flex gap-2">
                        <span className="text-accent">Q:</span> {item.question}
                      </h4>
                      <p className="text-brand-muted flex gap-2">
                        <span className="text-green-400 font-bold">A:</span> {item.answer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-brand-muted">No questions and answers available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, i) => (
                    <div key={i} className="border-b border-white/10 pb-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {review.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{review.user}</p>
                          <div className="flex text-yellow-400 text-xs">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={idx < review.rating ? 'fill-current' : 'text-white/20'}
                                size={14}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-brand-muted ml-14">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-brand-muted">Be the first to review this product!</p>
                )}
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="flex flex-wrap gap-2">
                {product.tags && product.tags.length > 0 ? (
                  product.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-sm py-2 px-4 bg-white/5 border-white/10 text-brand-subtle"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-brand-muted">No tags available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
