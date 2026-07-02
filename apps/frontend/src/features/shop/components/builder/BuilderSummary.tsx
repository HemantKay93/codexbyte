import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useBuilderStore, BUILDER_CATEGORIES, useCartStore } from '@byteevolvr/store';
import { useNavigate } from 'react-router-dom';

export function BuilderSummary() {
  const { selectedParts, totalPrice, clearBuilder } = useBuilderStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const price = totalPrice();

  const selectedCount = Object.keys(selectedParts).length;
  const totalRequired = BUILDER_CATEGORIES.length;
  const isComplete = selectedCount === totalRequired;

  const handleAddToCart = () => {
    Object.values(selectedParts).forEach((part) => {
      if (part) {
        addItem(part, 1);
      }
    });
    navigate('/shop/cart');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Build Summary</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Components Selected</span>
            <span className="text-white font-medium">
              {selectedCount} / {totalRequired}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${(selectedCount / totalRequired) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        {isComplete ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">Your build is complete and ready to order!</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              Select all required components to complete your build.
            </p>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-lg text-slate-300">Estimated Total</span>
          <span className="text-2xl font-bold text-white">${price.toFixed(2)}</span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={selectedCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          <button
            onClick={clearBuilder}
            disabled={selectedCount === 0}
            className="w-full py-3 px-4 bg-transparent border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
