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
  Grid
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
      {/* Top Announcement Bar - Clean Light White Theme */}
      <div className="bg-white border-b border-slate-200/80 text-slate-600 text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>100% Genuine OEM Spares</span>
            </span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Direct Fitment Guarantee</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-slate-500">
              Fast 48h Dispatch across India
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            <a
              href="tel:+918526613000"
              className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors"
            >
              <span className="font-semibold text-slate-800">📞 +91 85266 13000</span>
              <span className="text-slate-400 hidden sm:inline">(Pudukkottai)</span>
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold text-[10px] transition-colors shadow-2xs"
              >
                <LayoutDashboard className="w-3 h-3 text-red-600" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-base sm:text-xl font-black font-display tracking-tight text-slate-900 leading-none">
                    NEW ALAGAR
                  </span>
                  <span className="text-base sm:text-xl font-black font-display tracking-tight text-red-600 ml-1.5 leading-none">
                    AUTO PARTS
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                  PUDUKKOTTAI • GENUINE SPARES
                </span>
              </div>
            </Link>

            {/* Vehicle Selector Badge / Quick Trigger */}
            <div className="hidden lg:flex items-center shrink-0">
              {activeVehicle ? (
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
              ) : (
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-sm group"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-45 transition-transform" />
                  <span>Select Vehicle</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Clean Pill Search Bar */}
            <div className="relative flex-1 max-w-lg hidden md:block" ref={searchRef}>
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
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Mobile Vehicle Button */}
              <button
                onClick={() => setShowVehicleModal(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-red-600 transition-colors"
                title="Select Vehicle"
              >
                <Wrench className="w-4 h-4 text-amber-600" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-red-600 transition-all"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-950 text-white text-[9px] font-black flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-mono font-extrabold">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </Link>

              {/* Account Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-1 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
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

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar on Small Screens */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search spare parts, horns, lights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Desktop Clean Category Sub-Nav Bar */}
          <nav className="hidden md:flex items-center justify-between py-2 border-t border-slate-100 text-xs font-bold overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 lg:gap-2">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  location.pathname === '/'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>

              <Link
                to="/products?type=bike"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.search.includes('type=bike')
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Bikes / 2-Wheelers</span>
              </Link>

              <Link
                to="/products?type=auto"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.search.includes('type=auto')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto / 3-Wheelers</span>
              </Link>

              <Link
                to="/products?type=car"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.search.includes('type=car')
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Cars / 4-Wheelers</span>
              </Link>

              <Link
                to="/products?type=van"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.search.includes('type=van')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Vans / Commercial</span>
              </Link>
            </div>

            <div className="flex items-center gap-1 lg:gap-2">
              <Link
                to="/products?group=LIGHTS"
                className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition-colors"
              >
                Lights & Bulbs
              </Link>
              <Link
                to="/products?group=HORN"
                className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
              >
                Horns
              </Link>
              <Link
                to="/products?group=ACCESSORIES"
                className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                Accessories
              </Link>
              <Link
                to="/products"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
              >
                All Spares →
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl flex items-center justify-around py-1.5 px-2">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            location.pathname === '/' ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/products"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            location.pathname === '/products' ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>Catalog</span>
        </Link>
        <button
          onClick={() => setShowVehicleModal(true)}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            activeVehicle ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-5 h-5 mb-0.5 text-amber-600" />
          <span>{activeVehicle ? 'Vehicle' : 'Select'}</span>
        </button>
        <Link
          to="/cart"
          className={`relative flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            location.pathname === '/cart' ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>
        <Link
          to="/account"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-bold ${
            location.pathname.startsWith('/account') ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Account</span>
        </Link>
      </div>

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

              {/* Mobile Vehicle Quick Selector */}
              <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Vehicle Filter</p>
                {activeVehicle ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{activeVehicle.brandName} {activeVehicle.modelName}</p>
                      <p className="text-[10px] text-slate-500">{activeVehicle.year}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowVehicleModal(true);
                      }}
                      className="text-xs font-bold text-red-600 underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowVehicleModal(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Select Your Vehicle</span>
                  </button>
                )}
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
