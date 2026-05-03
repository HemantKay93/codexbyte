import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@byteevolvr/api-client';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prev => {
      // Check if product already exists in cart
      const existingItemIndex = prev.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        return updated;
      }
      
      // Add new item
      return [...prev, { ...product, quantity, cartItemId: crypto.randomUUID() }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
