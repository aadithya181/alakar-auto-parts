import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Bike,
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
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-[11px] md:text-xs font-semibold py-1.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Parts</span>
            <span className="hidden sm:inline text-white/60">•</span>
            <span className="hidden sm:flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Fast 48hr Dispatch</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white text-[11px]">
            <span className="font-semibold">📞 +91 85266 13000 &nbsp;|&nbsp; Pudukkottai</span>
            {isAdmin && (
              <Link to="/admin" className="font-bold underline text-amber-200 hover:text-white">
                Admin Panel →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-3 md:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base sm:text-xl md:text-2xl font-black font-display tracking-tight text-slate-900 flex items-center">
                  ALAKAR<span className="text-red-600 ml-1 hidden sm:inline">AUTO PARTS</span>
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-1">
                  PUDUKKOTTAI • GENUINE SPARES
                </span>
              </div>
            </Link>

            {/* Active Vehicle Badge / Selector Button */}
            <div className="hidden lg:flex items-center shrink-0">
              {activeVehicle ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs">
                  {activeVehicle.type === 'car' ? (
                    <Car className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <Bike className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-red-700 leading-none">Vehicle Fitment</p>
                    <p className="font-bold text-slate-900 truncate max-w-[150px]">
                      {activeVehicle.brandName} {activeVehicle.modelName} ({activeVehicle.year})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowVehicleModal(true)}
                    className="text-[10px] font-bold text-slate-600 hover:text-red-600 underline ml-1"
                  >
                    Change
                  </button>
                  <button
                    onClick={clearActiveVehicle}
                    title="Clear Vehicle Filter"
                    className="p-1 text-slate-400 hover:text-red-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select Vehicle</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search spare parts, SKU, brands (e.g. Swift Brake Pad, R15 Air Filter)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-2.5 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider bg-slate-50">
                    Matching Products & Parts
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {suggestions.map((item: any) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.slug || item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100'}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.brand_name} • <span className="font-mono text-slate-400">SKU: {item.sku}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-red-600">
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

            {/* Right Action Icons (Wishlist, Cart, Account) */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Vehicle Quick Toggle */}
              <button
                onClick={() => setShowVehicleModal(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-red-600"
                title="Select Vehicle"
              >
                <Wrench className="w-4 h-4 text-red-600" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-red-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all duration-200"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </Link>

              {/* Account Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-600" />
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
                          <span>Log Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="text-xs font-medium text-slate-600 mb-3">
                          Sign in to track orders and save your vehicle garage.
                        </p>
                        <Link
                          to="/login"
                          onClick={() => setShowAccountDropdown(false)}
                          className="block w-full py-2 text-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors mb-2"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setShowAccountDropdown(false)}
                          className="block w-full py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar on small screens */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search spare parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 py-2 border-t border-slate-100 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                location.pathname === '/' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Home</span>
            </Link>

            {/* LIGHTS Mega Dropdown */}
            <div className="relative group">
              <Link
                to="/products?category_slug=car-fog-lights"
                className="flex items-center gap-1 py-1 text-slate-700 group-hover:text-red-600 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>LIGHTS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-red-600 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                <div className="space-y-3">
                  {/* 1. Fog Lights */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">1. Fog Lights</span>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      <Link to="/products?category_slug=bike-fog-lights" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Bike</Link>
                      <Link to="/products?category_slug=auto-fog-lights" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Auto</Link>
                      <Link to="/products?category_slug=car-fog-lights" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Car</Link>
                      <Link to="/products?category_slug=van-fog-lights" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Van</Link>
                    </div>
                  </div>

                  {/* 2. Head Light Bulbs */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">2. Head Light Bulbs</span>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      <Link to="/products?category_slug=bike-head-light-bulbs" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Bike</Link>
                      <Link to="/products?category_slug=auto-head-light-bulbs" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Auto</Link>
                      <Link to="/products?category_slug=car-head-light-bulbs" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Car</Link>
                      <Link to="/products?category_slug=van-head-light-bulbs" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Van</Link>
                    </div>
                  </div>

                  {/* 3. Fancy LED */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">3. Fancy LED</span>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      <Link to="/products?category_slug=bike-fancy-led" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Bike</Link>
                      <Link to="/products?category_slug=auto-fancy-led" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Auto</Link>
                      <Link to="/products?category_slug=car-fancy-led" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Car</Link>
                      <Link to="/products?category_slug=van-fancy-led" className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-[11px] font-semibold text-center border border-slate-100">Van</Link>
                    </div>
                  </div>

                  {/* 4. Coach Lights */}
                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      to="/products?category_slug=coach-lights"
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-700 text-xs font-bold text-slate-800"
                    >
                      <span>4. Coach Lights (Van / Bus)</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCESSORIES Dropdown */}
            <div className="relative group">
              <Link
                to="/products?category_slug=car-accessories"
                className="flex items-center gap-1 py-1 text-slate-700 group-hover:text-red-600 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span>ACCESSORIES</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-red-600 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                <div className="space-y-1">
                  <Link to="/products?category_slug=bike-accessories" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    1. Bike Accessories
                  </Link>
                  <Link to="/products?category_slug=car-accessories" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    2. Car Accessories
                  </Link>
                  <Link to="/products?category_slug=van-accessories" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    3. Van Accessories
                  </Link>
                </div>
              </div>
            </div>

            {/* HORN Dropdown */}
            <div className="relative group">
              <Link
                to="/products?category_slug=car-horns"
                className="flex items-center gap-1 py-1 text-slate-700 group-hover:text-red-600 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>HORN</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-red-600 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                <div className="space-y-1">
                  <Link to="/products?category_slug=bike-horns" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    1. Bike Horns
                  </Link>
                  <Link to="/products?category_slug=auto-horns" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    2. Auto Horns
                  </Link>
                  <Link to="/products?category_slug=car-horns" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    3. Car Horns
                  </Link>
                  <Link to="/products?category_slug=van-horns" className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors">
                    4. Van Horns
                  </Link>
                </div>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Vehicle Type Quick Links */}
            <div className="flex items-center gap-3 text-[11px]">
              <Link to="/products?type=bike" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white transition-colors">
                Bike
              </Link>
              <Link to="/products?type=auto" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white transition-colors">
                Auto
              </Link>
              <Link to="/products?type=car" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white transition-colors">
                Car
              </Link>
              <Link to="/products?type=van" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white transition-colors">
                Van
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile Screens) */}
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
          <span>{activeVehicle ? 'Garage' : 'Vehicle'}</span>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xl font-black font-display text-slate-900">
                    ALAKAR<span className="text-red-600 ml-1">AUTO PARTS</span>
                  </span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pudukkottai</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Signed in as <span className="text-slate-900 font-bold">{user.name}</span></p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-red-600 text-xs font-bold hover:bg-slate-200"
                  >
                    Log Out
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowVehicleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 z-10"
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
