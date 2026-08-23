import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Heart,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();
  const { toggleWishlist } = useWishlist();
  const { showSuccess } = useToast();

  const shippingCharge = subtotal >= 999 || subtotal === 0 ? 0.00 : 99.00;
  const grandTotal = Math.max(0, subtotal + shippingCharge);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Looks like you haven't added any spare parts or accessories to your cart yet.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md shadow-red-600/20"
        >
          <span>Find Parts for Your Vehicle</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

      <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight mb-6 sm:mb-8">
        Shopping Cart <span className="text-sm font-semibold text-slate-500">({totalItems} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const pid = item.product_id || item.id;
            return (
              <div
                key={pid}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400'}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                      {item.brand_name || 'Genuine Part'}
                    </span>
                    <Link
                      to={`/product/${item.slug || pid}`}
                      className="block text-xs sm:text-sm font-bold text-slate-900 hover:text-red-600 transition-colors truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                      SKU: {item.sku}
                    </p>
                    <div className="flex items-center gap-2 mt-1 sm:hidden">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{Number(item.selling_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Modifier & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(pid, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-800 font-bold text-xs shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(pid, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-800 font-bold text-xs shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal for Item */}
                  <div className="w-24 text-right hidden sm:block">
                    <span className="text-sm font-black text-slate-900">
                      ₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove & Wishlist Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        toggleWishlist(item);
                        removeFromCart(pid);
                        showSuccess('Moved to wishlist');
                      }}
                      title="Move to Wishlist"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        removeFromCart(pid);
                        showSuccess('Removed from cart');
                      }}
                      title="Remove Item"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-3 flex items-center justify-between">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-5">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Price Calculations Breakdown */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-slate-900">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping & Delivery</span>
                {shippingCharge === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingCharge}</span>
                )}
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Estimated GST (18% inclusive)</span>
                <span>₹{(subtotal * 0.18 / 1.18).toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{Number(grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
