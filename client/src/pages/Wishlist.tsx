import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Wishlist: React.FC = () => {
  const { wishlistProducts, wishlistCount } = useWishlist();

  if (wishlistCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Save your favorite spare parts and automotive accessories to keep an eye on prices and fitment.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md shadow-red-600/20"
        >
          <span>Explore Compatible Parts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: 'Saved Wishlist' }]} />

      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlistCount} item{wishlistCount > 1 ? 's' : ''} saved in your garage list
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {wishlistProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};
