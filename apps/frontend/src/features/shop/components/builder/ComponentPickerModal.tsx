import { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { ComponentCategory } from '@byteevolvr/store';
import { ProductService, Product } from '@byteevolvr/api-client';

interface ComponentPickerModalProps {
  category: ComponentCategory;
  onClose: () => void;
  onSelect: (product: any) => void;
}

export function ComponentPickerModal({ category, onClose, onSelect }: ComponentPickerModalProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      try {
        // Fetch products that match the builder category
        const data = await ProductService.getProducts({
          category: category,
          limit: 50,
        });
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch components', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, [category]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white capitalize">Select {category}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search for a ${category}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p className="text-lg">No components found for this category.</p>
              <p className="text-sm mt-2">Try a different search term or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-accent/50 transition-all cursor-pointer group"
                  onClick={() => onSelect(product)}
                >
                  <div className="w-24 h-24 shrink-0 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-slate-600 text-xs text-center p-2">No Image</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-xs text-slate-400 mt-1">{product.brand}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold text-white">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <button className="px-4 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-md text-sm font-medium transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
