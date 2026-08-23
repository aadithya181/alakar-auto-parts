import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from './RatingStars';
import { CompatibilityBadge } from './CompatibilityBadge';
import { Product } from '../types';

interface ProductCardProps {
  product: Product | any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useToast();
  const [added, setAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const imageUrl = product.primary_image || (product.images && product.images[0]?.image_url) || 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    showSuccess(`"${product.name}" added to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const mrp = Number(product.mrp) || Number(product.selling_price) || 0;
  const sellingPrice = Number(product.selling_price) || 0;
  const discount = product.discount_percentage || (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);

  return (
    <div className="group relative bg-white hover:bg-white border border-slate-200 hover:border-red-400 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-card hover:shadow-card-hover">
      {/* Top Image Container */}
      <Link to={`/product/${product.slug || product.id}`} className="relative block aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.is_bestseller && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-slate-950" /> Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-sm ${
            inWishlist
              ? 'bg-red-600 text-white'
              : 'bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Alert Badge if low */}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-semibold">
            Only {product.stock_quantity} left
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide truncate">
              {product.brand_name || 'Genuine Part'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {product.sku}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug || product.id}`} className="block mb-1.5">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Compatibility badge */}
          <div className="mb-2">
            <CompatibilityBadge product={product} />
          </div>

          {/* Rating */}
          <div className="mb-2.5">
            <RatingStars
              rating={product.avg_rating || product.rating_avg || 4.8}
              totalReviews={product.total_reviews || product.rating_count}
              size="sm"
            />
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {mrp > sellingPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500">Incl. all taxes</p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 shadow-sm active:scale-95 ${
              product.stock_quantity <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Added</span>
              </>
            ) : product.stock_quantity <= 0 ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
