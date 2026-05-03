import React, { useState, useEffect } from 'react';
import { Card, CardContent, Input, Button, Badge } from '../components/ui';
import { Search, ShoppingCart, CreditCard, Banknote, User, Plus, Minus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<any>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckout = async (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      console.log('Starting checkout for method:', method);
      
      // 1. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('Not authenticated. Please log in again.');
      }
      console.log('Authenticated as:', user.email, user.id);

      // 2. Create Order
      const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
      const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      console.log('Inserting order:', { orderNumber, subtotal, total });
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'processing',
          payment_status: 'captured',
          payment_method: method,
          subtotal,
          tax_amount: tax,
          total_amount: total,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order insertion error:', orderError);
        throw orderError;
      }
      console.log('Order created successfully:', order.id);

      // 3. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        sku: item.sku || '',
        quantity: item.qty,
        unit_price: Number(item.price),
        total_price: Number(item.price) * item.qty,
      }));

      console.log('Inserting order items:', orderItems.length);
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error('Order items insertion error:', itemsError);
        throw itemsError;
      }

      // 4. Update Inventory
      console.log('Updating inventory...');
      for (const item of cart) {
        const currentStock = products.find(p => p.id === item.id)?.stock_quantity || 0;
        const newStock = Math.max(0, currentStock - item.qty);
        await supabase.from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.id);
      }

      setSuccess(true);
      setCart([]);
      fetchProducts(); // Refresh products to get updated stock
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Checkout failed deep catch:', err);
      alert(`Checkout failed: ${err.message || (err.error_description) || 'Check console for RLS/Database errors'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
  const tax = subtotal * 0.18; 
  const total = subtotal + tax;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-display-sm font-semibold text-on-background">Point of Sale</h1>
          {success && (
            <div className="flex items-center gap-2 text-success font-medium animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="h-5 w-5" />
              Order completed successfully!
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-on-surface-variant" />
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-on-surface-variant">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all h-36 flex flex-col justify-between p-4 group bg-surface"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <div className="font-semibold text-on-surface line-clamp-2 group-hover:text-primary transition-colors text-sm">{product.name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase">{product.sku}</span>
                      <Badge variant={product.stock_quantity > 0 ? 'success' : 'error'} className="text-[10px]">
                        {product.stock_quantity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">₹{Number(product.price).toLocaleString()}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <Card className="w-96 flex flex-col h-full bg-surface-container-low border-l border-outline-variant shadow-none rounded-none -my-6 -mr-6 py-6 px-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg text-on-surface">Current Order</span>
          </div>
          <Badge variant="info">{cart.reduce((a, b) => a + b.qty, 0)} items</Badge>
        </div>

        <div className="flex items-center gap-2 mb-4 bg-surface p-2 rounded border border-outline-variant">
          <User className="h-4 w-4 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">Walk-in Customer</span>
          <Button variant="ghost" size="sm" className="ml-auto text-xs py-1 h-auto">Edit</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center text-on-surface-variant text-sm py-20 flex flex-col items-center">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
              Cart is empty.<br/>Select items to start.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col bg-surface p-3 rounded border border-outline-variant hover:border-outline transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm text-on-surface leading-tight pr-4">{item.name}</div>
                  <div className="font-bold text-sm">₹{(Number(item.price) * item.qty).toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-on-surface-variant font-medium">₹{Number(item.price).toLocaleString()} × {item.qty}</div>
                  <div className="flex items-center gap-1.5 bg-surface-container rounded-lg p-1 border border-outline-variant">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }} 
                      className="p-1 text-on-surface hover:text-error transition-colors rounded hover:bg-surface"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }} 
                      className="p-1 text-on-surface hover:text-primary transition-colors rounded hover:bg-surface"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-outline-variant pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>GST (18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-on-surface pt-3 border-t border-outline-variant mt-2">
            <span>Total</span>
            <span className="text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button 
            variant="secondary" 
            className="gap-2 h-14 font-bold" 
            disabled={cart.length === 0 || isProcessing}
            onClick={() => handleCheckout('cash')}
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Banknote className="h-5 w-5" />}
            Cash
          </Button>
          <Button 
            className="gap-2 h-14 font-bold" 
            disabled={cart.length === 0 || isProcessing}
            onClick={() => handleCheckout('card')}
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
            Card
          </Button>
        </div>
      </Card>
    </div>
  );
}
