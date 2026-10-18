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
    <div className="card-interactive group relative bg-white border border-slate-200 hover:border-red-500/70 rounded-3xl overflow-hidden flex flex-col h-full shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Top Image Container */}
      <Link to={`/product/${product.slug || product.id}`} className="relative block aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/60 overflow-hidden border-b border-slate-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Glossy Sheen Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="eyebrow-tag px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30">
              {discount}% OFF
            </span>
          )}
          {product.is_bestseller && (
            <span className="eyebrow-tag px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm flex items-center gap-1 border border-amber-300">
              <Zap className="w-3 h-3 fill-slate-950" /> Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button with Frosted Glass Effect */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`btn-bounce absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-sm ${
            inWishlist
              ? 'bg-red-600 text-white shadow-red-600/30 ring-2 ring-white/60'
              : 'bg-white/95 text-slate-600 hover:text-red-600 hover:bg-white hover:scale-105'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Alert Badge if low */}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/95 text-slate-950 text-[10px] font-black uppercase tracking-wide backdrop-blur-sm shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            <span>Only {product.stock_quantity} left</span>
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Brand & Laser-Engraved SKU Plate */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="eyebrow-tag px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider truncate shadow-2xs">
              {product.brand_name || 'Genuine OEM'}
            </span>
            <span className="sku-code text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 font-bold shrink-0">
              {product.sku}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug || product.id}`} className="block mb-2">
            <h3 className="heading-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Compatibility badge */}
          <div className="mb-2">
            <CompatibilityBadge product={product} />
          </div>

          {/* Rating */}
          <div className="mb-1">
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
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-slate-950 font-display tracking-tight">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {mrp > sellingPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {mrp > sellingPrice && (
              <span className="inline-block text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md mt-0.5">
                Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className={`btn-bounce px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
              product.stock_quantity <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-md shadow-red-600/25'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> <span className="hidden sm:inline">Added</span>
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
