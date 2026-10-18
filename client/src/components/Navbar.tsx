import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Bike,
  Truck,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Zap,
  LogOut,
  Package,
  Wrench,
  LayoutDashboard,
  Home,
  Grid,
  Lightbulb,
  Volume2,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useVehicle } from '../context/VehicleContext';
import { VehicleSelector } from './VehicleSelector';
import api from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { activeVehicle, clearActiveVehicle } = useVehicle();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res: any = await api.get('/products/suggestions', { params: { q: searchQuery } });
        if (res.success) {
          setSuggestions(res.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Search suggestions error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Car Parts', path: '/car-parts' },
    { label: 'Bike Parts', path: '/bike-parts' },
    { label: 'All Products', path: '/products' },
  ];

  return (
    <>
      {/* Sleek High-End Automotive Top Announcement Strip */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800/80 text-[11px] py-1.5 px-3 sm:px-6 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-white font-extrabold tracking-wide">NEW ALAGAR AUTO PARTS</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">100% Genuine Spare Parts • Pudukkottai Store</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold">
            <span className="text-amber-400 font-mono hidden md:inline">⚡ Direct Dispatch from Store</span>
            <a href="tel:8526613000" className="flex items-center gap-1.5 text-slate-200 hover:text-red-400 transition-colors">
              <Phone className="w-3 h-3 text-red-500 shrink-0" />
              <span>Call / WhatsApp: <span className="font-mono text-white">8526613000</span></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 transition-transform shrink-0">
                <Car className="w-4 h-4 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline truncate">
                  <span className="text-sm sm:text-xl font-black font-display tracking-tight text-slate-900 leading-none">
                    NEW ALAGAR
                  </span>
                  <span className="text-sm sm:text-xl font-black font-display tracking-tight text-red-600 ml-1 sm:ml-1.5 leading-none">
                    AUTO PARTS
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider sm:tracking-widest text-slate-400 font-bold mt-0.5 sm:mt-1 truncate">
                  PUDUKKOTTAI • GENUINE SPARES
                </span>
              </div>
            </Link>

            {/* Active Vehicle Badge (Only shown when a vehicle filter is active) */}
            {activeVehicle && (
              <div className="hidden lg:flex items-center shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-red-50 border border-red-200 text-xs shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                    {activeVehicle.type === 'bike' ? (
                      <Bike className="w-3.5 h-3.5" />
                    ) : (
                      <Car className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-[9px] uppercase font-bold text-red-700">Vehicle Filter Active</p>
                    <p className="font-bold text-slate-900 truncate max-w-[140px]">
                      {activeVehicle.brandName} {activeVehicle.modelName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowVehicleModal(true)}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 underline ml-1"
                  >
                    Change
                  </button>
                  <button
                    onClick={clearActiveVehicle}
                    title="Clear vehicle filter"
                    className="p-1 text-slate-400 hover:text-red-600 ml-0.5 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Clean Pill Search Bar */}
            <div className="relative flex-1 max-w-xl hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search spare parts, SKUs, brands (e.g. 5M Horn, Fog Light, Bulbs)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded">
                    ⌘K
                  </span>
                )}
              </form>

              {/* Live Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2.5 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-500 tracking-wider bg-slate-50 flex items-center justify-between">
                    <span>Matching Products & Parts</span>
                    <span className="text-[9px] text-slate-400">{suggestions.length} results</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {suggestions.map((item: any) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.slug || item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors group"
                      >
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100'}
                          alt={item.name}
                          className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.brand_name} • <span className="font-mono text-slate-400">SKU: {item.sku}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-red-600">
                            ₹{Number(item.selling_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 text-center text-xs font-bold text-red-600 bg-slate-50 hover:bg-slate-100 transition-colors border-t border-slate-100"
                  >
                    View All Results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>

            {/* Right Header Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

              {/* Wishlist (Desktop) */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden md:flex relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-red-600 transition-all shrink-0"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button (Desktop) */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-95 shrink-0"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-950 text-white text-[9px] font-black flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="font-mono font-extrabold">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </Link>

              {/* Account Dropdown (Desktop) */}
              <div className="relative hidden md:block shrink-0" ref={accountRef}>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-1 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-red-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          to="/account"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          to="/account?tab=orders"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/account?tab=garage"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Wrench className="w-4 h-4 text-slate-400" />
                          <span>My Garage</span>
                        </Link>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            logout();
                            setShowAccountDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="text-xs font-medium text-slate-600 mb-3">
                          Sign in to manage your garage, track orders & view genuine warranties.
                        </p>
                        <Link
                          to="/login"
                          onClick={() => setShowAccountDropdown(false)}
                          className="block w-full py-2 text-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors mb-2 shadow-sm"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setShowAccountDropdown(false)}
                          className="block w-full py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Quick Cart Button */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="md:hidden relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 active:scale-95 transition-all shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black font-mono flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar & Fast Collections Bar */}
          <div className="md:hidden pb-2" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative mb-2">
              <input
                type="text"
                placeholder="Search spare parts, horns, lights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Mobile Fast Collections Horizontal Rail */}
            <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <Link
                to="/"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.pathname === '/' && !location.search
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>Home</span>
              </Link>

              <Link
                to="/products?type=bike"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('type=bike')
                    ? 'bg-white text-slate-950 shadow-sm border border-amber-300'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Bike className="w-3 h-3 text-amber-600" />
                <span>Bikes</span>
              </Link>

              <Link
                to="/products?type=auto"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('type=auto')
                    ? 'bg-white text-slate-900 shadow-sm border border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Auto</span>
              </Link>

              <Link
                to="/products?type=car"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('type=car')
                    ? 'bg-white text-slate-900 shadow-sm border border-red-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3 h-3 text-red-600" />
                <span>Cars</span>
              </Link>

              <Link
                to="/products?type=van"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('type=van')
                    ? 'bg-white text-slate-900 shadow-sm border border-blue-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3 h-3 text-blue-600" />
                <span>Vans</span>
              </Link>

              <div className="w-px h-4 bg-slate-300 mx-0.5 shrink-0" />

              <Link
                to="/products?group=LIGHTS"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('group=LIGHTS')
                    ? 'bg-white text-slate-900 shadow-sm border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-600" />
                <span>Lights</span>
                <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-black">LED</span>
              </Link>

              <Link
                to="/products?group=HORN"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('group=HORN')
                    ? 'bg-white text-slate-900 shadow-sm border border-red-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Volume2 className="w-3 h-3 text-red-600" />
                <span>Horns</span>
                <span className="text-[9px] px-1 rounded bg-red-100 text-red-800 font-black">112dB</span>
              </Link>

              <Link
                to="/products?group=ACCESSORIES"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  location.search.includes('group=ACCESSORIES')
                    ? 'bg-white text-slate-900 shadow-sm border border-blue-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3 h-3 text-blue-600" />
                <span>Accessories</span>
              </Link>
            </div>
          </div>

          {/* Desktop High-End Automotive Unified Segmented Tab Bar */}
          <nav aria-label="Quick Category Tabs" className="hidden md:flex items-center justify-between py-2 border-t border-slate-200/70">
            {/* The Unified Tab Track */}
            <div
              role="tablist"
              className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner inline-flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none"
            >
              {/* Home Tab */}
              <Link
                to="/"
                role="tab"
                aria-selected={location.pathname === '/' && !location.search}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.pathname === '/' && !location.search
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <span>Home</span>
              </Link>

              {/* Bikes Tab */}
              <Link
                to="/products?type=bike"
                role="tab"
                aria-selected={location.search.includes('type=bike')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('type=bike')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-amber-300/80 ring-1 ring-amber-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Bike
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('type=bike')
                      ? 'text-amber-600'
                      : 'text-amber-500/80 group-hover:text-amber-600'
                  }`}
                />
                <span>Bikes (2W)</span>
              </Link>

              {/* Auto Tab */}
              <Link
                to="/products?type=auto"
                role="tab"
                aria-selected={location.search.includes('type=auto')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('type=auto')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-emerald-300/80 ring-1 ring-emerald-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Zap
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('type=auto')
                      ? 'text-emerald-600'
                      : 'text-emerald-500/80 group-hover:text-emerald-600'
                  }`}
                />
                <span>Auto (3W)</span>
              </Link>

              {/* Cars Tab */}
              <Link
                to="/products?type=car"
                role="tab"
                aria-selected={location.search.includes('type=car')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('type=car')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-red-300/80 ring-1 ring-red-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Car
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('type=car')
                      ? 'text-red-600'
                      : 'text-red-500/80 group-hover:text-red-600'
                  }`}
                />
                <span>Cars (4W)</span>
              </Link>

              {/* Vans Tab */}
              <Link
                to="/products?type=van"
                role="tab"
                aria-selected={location.search.includes('type=van')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('type=van')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-blue-300/80 ring-1 ring-blue-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Truck
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('type=van')
                      ? 'text-blue-600'
                      : 'text-blue-500/80 group-hover:text-blue-600'
                  }`}
                />
                <span>Vans / Pickups</span>
              </Link>

              {/* In-Track Divider */}
              <div className="w-px h-5 bg-slate-300/80 mx-1 shrink-0" />

              {/* Lights & Bulbs Tab */}
              <Link
                to="/products?group=LIGHTS"
                role="tab"
                aria-selected={location.search.includes('group=LIGHTS')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('group=LIGHTS')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-amber-400/90 ring-1 ring-amber-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Lightbulb
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('group=LIGHTS')
                      ? 'text-amber-500 fill-amber-500/20'
                      : 'text-amber-600/70 group-hover:text-amber-600'
                  }`}
                />
                <span>Lights</span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300/60">
                  LED
                </span>
              </Link>

              {/* Horns Tab */}
              <Link
                to="/products?group=HORN"
                role="tab"
                aria-selected={location.search.includes('group=HORN')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('group=HORN')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-red-400/90 ring-1 ring-red-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Volume2
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('group=HORN')
                      ? 'text-red-600 fill-red-500/20'
                      : 'text-red-500/70 group-hover:text-red-600'
                  }`}
                />
                <span>Horns</span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300/60">
                  112dB
                </span>
              </Link>

              {/* Accessories Tab */}
              <Link
                to="/products?group=ACCESSORIES"
                role="tab"
                aria-selected={location.search.includes('group=ACCESSORIES')}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  location.search.includes('group=ACCESSORIES')
                    ? 'bg-white text-slate-950 font-black shadow-sm border border-blue-400/90 ring-1 ring-blue-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Wrench
                  className={`w-3.5 h-3.5 transition-colors ${
                    location.search.includes('group=ACCESSORIES')
                      ? 'text-blue-600'
                      : 'text-blue-500/70 group-hover:text-blue-600'
                  }`}
                />
                <span>Accessories</span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300/60">
                  OEM
                </span>
              </Link>
            </div>

            {/* Right: All Spares Link */}
            <Link
              to="/products"
              className="btn-bounce ml-3 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <span>Explore All Spares</span>
              <span className="text-red-400 font-black">→</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Minimalist iOS Frosted Bottom Navigation Bar (Apple Store / Airbnb Style) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/75 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] px-2 pt-1 pb-safe"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Home */}
          <Link
            to="/"
            className="group relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
          >
            {/* Top Indicator Bar */}
            <span
              className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${
                location.pathname === '/' && !location.search
                  ? 'bg-red-600 opacity-100 scale-100'
                  : 'bg-transparent opacity-0 scale-75'
              }`}
            />
            <Home
              className={`w-5 h-5 transition-colors ${
                location.pathname === '/' && !location.search
                  ? 'text-red-600 fill-red-600/15'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight leading-tight mt-0.5 transition-colors ${
                location.pathname === '/' && !location.search
                  ? 'font-bold text-red-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
              }`}
            >
              Home
            </span>
          </Link>

          {/* Products */}
          <Link
            to="/products"
            className="group relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
          >
            {/* Top Indicator Bar */}
            <span
              className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${
                location.pathname === '/products' || location.pathname.startsWith('/category')
                  ? 'bg-red-600 opacity-100 scale-100'
                  : 'bg-transparent opacity-0 scale-75'
              }`}
            />
            <Grid
              className={`w-5 h-5 transition-colors ${
                location.pathname === '/products' || location.pathname.startsWith('/category')
                  ? 'text-red-600 fill-red-600/15'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight leading-tight mt-0.5 transition-colors ${
                location.pathname === '/products' || location.pathname.startsWith('/category')
                  ? 'font-bold text-red-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
              }`}
            >
              Products
            </span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="group relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
          >
            {/* Top Indicator Bar */}
            <span
              className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${
                location.pathname === '/wishlist'
                  ? 'bg-red-600 opacity-100 scale-100'
                  : 'bg-transparent opacity-0 scale-75'
              }`}
            />
            <div className="relative">
              <Heart
                className={`w-5 h-5 transition-colors ${
                  location.pathname === '/wishlist'
                    ? 'text-red-600 fill-red-600/15'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight leading-tight mt-0.5 transition-colors ${
                location.pathname === '/wishlist'
                  ? 'font-bold text-red-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
              }`}
            >
              Wishlist
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="group relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
          >
            {/* Top Indicator Bar */}
            <span
              className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${
                location.pathname === '/cart'
                  ? 'bg-red-600 opacity-100 scale-100'
                  : 'bg-transparent opacity-0 scale-75'
              }`}
            />
            <div className="relative">
              <ShoppingCart
                className={`w-5 h-5 transition-colors ${
                  location.pathname === '/cart'
                    ? 'text-red-600 fill-red-600/15'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-black flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight leading-tight mt-0.5 transition-colors ${
                location.pathname === '/cart'
                  ? 'font-bold text-red-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
              }`}
            >
              Cart
            </span>
          </Link>

          {/* Account */}
          <Link
            to={user ? "/account" : "/login"}
            className="group relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
          >
            {/* Top Indicator Bar */}
            <span
              className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${
                location.pathname.startsWith('/account') || location.pathname === '/login' || location.pathname === '/register'
                  ? 'bg-red-600 opacity-100 scale-100'
                  : 'bg-transparent opacity-0 scale-75'
              }`}
            />
            <User
              className={`w-5 h-5 transition-colors ${
                location.pathname.startsWith('/account') || location.pathname === '/login'
                  ? 'text-red-600 fill-red-600/15'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight leading-tight mt-0.5 transition-colors truncate max-w-[56px] ${
                location.pathname.startsWith('/account') || location.pathname === '/login'
                  ? 'font-bold text-red-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
              }`}
            >
              Account
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white border-r border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-black font-display text-slate-900">
                      NEW ALAGAR
                    </span>
                    <span className="text-base font-black font-display text-red-600 ml-1">
                      AUTO
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pudukkottai</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/products?type=bike"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  🏍️ Bike Spares (2-Wheelers)
                </Link>
                <Link
                  to="/products?type=auto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  🛺 Auto Spares (3-Wheelers)
                </Link>
                <Link
                  to="/products?type=car"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  🚗 Car Spares (4-Wheelers)
                </Link>
                <Link
                  to="/products?type=van"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  🚐 Van & Commercial Spares
                </Link>
                <div className="pt-2 pb-1 border-t border-slate-100 my-1">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Featured Collections</p>
                  <Link
                    to="/products?group=LIGHTS"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    💡 Lights & Bulbs
                  </Link>
                  <Link
                    to="/products?group=HORN"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    📢 Horns & Sound Alerts
                  </Link>
                  <Link
                    to="/products?group=ACCESSORIES"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    🔧 Automotive Accessories
                  </Link>
                </div>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  All Products
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-50 border border-red-200 mt-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Signed in as <span className="text-slate-900 font-bold">{user.name}</span>
                  </p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-red-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-600/20"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Selector Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowVehicleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <VehicleSelector
              onSelectComplete={() => setShowVehicleModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
