import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { Product } from '../types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: any) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('torq_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('torq_wishlist_ids', JSON.stringify(wishlistIds));
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res: any = await api.get('/wishlist');
      if (res.success) {
        setWishlistProducts(res.wishlist || []);
        setWishlistIds((res.wishlist || []).map((p: any) => p.id));
      }
    } catch (err: any) {
      console.warn('Failed to fetch wishlist', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product: any) => {
    const pid = product.id || product.product_id;
    const exists = wishlistIds.includes(pid);

    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => id !== pid));
      setWishlistProducts((prev) => prev.filter((p) => p.id !== pid));
    } else {
      setWishlistIds((prev) => [...prev, pid]);
      setWishlistProducts((prev) => [...prev, product]);
    }

    if (token) {
      try {
        await api.post('/wishlist/toggle', { product_id: pid });
      } catch (err: any) {
        console.warn('Failed to sync wishlist with server', err.message);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistIds.length,
        loading,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
