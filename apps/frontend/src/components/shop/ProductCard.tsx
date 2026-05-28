import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@byteevolvr/api-client';
import { useCartStore } from '@byteevolvr/store';

import { useStoreCurrency } from '@/features/shop/hooks/useStoreCurrency';

interface ProductCardProps {
  product: Product;
  tag?: string;
  tagClass?: string;
  label?: string;
}

export function ProductCard({ product, tag, tagClass, label }: ProductCardProps) {
  const { addItem } = useCartStore();
  const currencySymbol = useStoreCurrency();

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
}
