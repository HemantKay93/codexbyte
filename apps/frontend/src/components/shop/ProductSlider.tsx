import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@byteevolvr/api-client';

import { ProductCard } from './ProductCard';

interface ProductSliderProps {
  products: Product[];
  tag?: string;
  tagClass?: string;
  label?: string;
}

export function ProductSlider({ products, tag, tagClass, label }: ProductSliderProps) {
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
        // eslint-disable-line @typescript-eslint/no-explicit-any
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
}
