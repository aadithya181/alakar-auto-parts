import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { Product } from '../types';

export interface CartItemModel {
  id: string;
  product_id: string;
  name: string;
  slug?: string;
  sku?: string;
  selling_price: number;
  mrp?: number;
  image_url?: string;
  brand_name?: string;
  stock_quantity?: number;
  quantity: number;
}

interface CartContextType {
  items: CartItemModel[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalMrp: number;
  totalDiscount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemModel[]>(() => {
    try {
      const saved = localStorage.getItem('torq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Sync to local storage & server
  useEffect(() => {
    localStorage.setItem('torq_cart', JSON.stringify(items));
    if (user) {
      syncWithServer(items);
    }
  }, [items, user]);

  const syncWithServer = async (cartItems: CartItemModel[]) => {
    try {
      await api.post('/cart/sync', { items: cartItems });
    } catch (err: any) {
      console.warn('Cart background sync notice:', err.message);
    }
  };

  const addToCart = (product: any, quantity = 1) => {
    setItems((prevItems) => {
      const pId = product.product_id || product.id;
      const existingIndex = prevItems.findIndex((i) => (i.product_id || i.id) === pId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product_id: product.id || product.product_id,
            id: product.id || product.product_id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            selling_price: Number(product.selling_price) || 0,
            mrp: Number(product.mrp) || Number(product.selling_price) || 0,
            image_url: product.primary_image || product.image_url || (product.images && product.images[0]?.image_url) || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60',
            brand_name: product.brand_name,
            stock_quantity: product.stock_quantity ?? 10,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        (item.product_id || item.id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => (item.product_id || item.id) !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('torq_cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.selling_price || 0) * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + (item.mrp || item.selling_price || 0) * item.quantity, 0);
  const totalDiscount = Math.max(0, totalMrp - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        totalMrp,
        totalDiscount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
