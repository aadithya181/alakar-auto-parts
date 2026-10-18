import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Bike,
  Truck,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Wrench,
  Phone,
  MapPin,
  Clock,
  Search,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/skeletons/ProductCardSkeleton';
import api from '../services/api';
import { Product, Category, Brand } from '../types';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [carProducts, setCarProducts] = useState<Product[]>([]);
  const [bikeProducts, setBikeProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTab, setProductFilterTab] = useState<'all' | 'car' | 'bike'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, carRes, bikeRes, brandRes]: any[] = await Promise.all([
          api.get('/products', { params: { limit: 4, featured: true } }),
          api.get('/products', { params: { limit: 4, vehicle_type: 'car' } }),
          api.get('/products', { params: { limit: 4, vehicle_type: 'bike' } }),
          api.get('/brands', { params: { featured: true } }),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (carRes.success) setCarProducts(carRes.products || []);
        if (bikeRes.success) setBikeProducts(bikeRes.products || []);
        if (brandRes.success) setBrands(brandRes.brands || []);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const vehicleQuickCards = [
    {
      title: 'Bikes',
      badge: '2-Wheeler',
      link: '/products?type=bike',
      icon: Bike,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      accentColor: 'text-amber-600',
    },
    {
      title: 'Auto',
      badge: '3-Wheeler',
      link: '/products?type=auto',
      icon: Zap,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      accentColor: 'text-emerald-600',
    },
    {
      title: 'Cars',
      badge: '4-Wheeler',
      link: '/products?type=car',
      icon: Car,
      iconColor: 'text-red-600 bg-red-50 border-red-200',
      hoverBorder: 'hover:border-red-400',
      accentColor: 'text-red-600',
    },
    {
      title: 'Commercial',
      badge: 'Vans & Heavy',
      link: '/products?type=van',
      icon: Truck,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      accentColor: 'text-blue-600',
    },
  ];

  const displayedProducts = useMemo(() => {
    if (productTab === 'car') {
      return carProducts.length > 0
        ? carProducts
        : featuredProducts.filter((p) => p.vehicle_type === 'car' || p.vehicle_type === 'both');
    }
    if (productTab === 'bike') {
      return bikeProducts.length > 0
        ? bikeProducts
        : featuredProducts.filter((p) => p.vehicle_type === 'bike' || p.vehicle_type === 'both');
    }
    return featuredProducts;
  }, [productTab, featuredProducts, carProducts, bikeProducts]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-slate-50 pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Genuine Spares • Pudukkottai</span>
            </div>
            <h1 className="heading-display tracking-tight text-slate-900 leading-tight">
              Precision Auto Parts, <br className="hidden sm:inline" />
              <span className="text-red-600">Guaranteed to Fit.</span>
            </h1>

            {/* Clean Hero Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-none mx-auto">
              <Link
                to="/products"
                className="btn-bounce w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Browse Spares →</span>
              </Link>
              <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center">
                <Link
                  to="/products?type=bike"
                  className="btn-bounce px-4 sm:px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Bike className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bike Parts</span>
                </Link>
                <Link
                  to="/products?type=car"
                  className="btn-bounce px-4 sm:px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Car className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Car Parts</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Vehicle Quick Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
            Shop by Vehicle
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {vehicleQuickCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className={`group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 ${card.hoverBorder} shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-2xl border ${card.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-display group-hover:text-red-600 transition-colors">
                    {card.title}
                  </h3>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className={card.accentColor}>Explore</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${card.accentColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Spares Showcase */}
      {(loading || featuredProducts.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="heading-xl tracking-tight">
                Featured Spares
              </h2>
            </div>

            {/* Quick Segmented Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setProductFilterTab('all')}
                  className={`btn-bounce px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    productTab === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setProductFilterTab('car')}
                  className={`btn-bounce px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    productTab === 'car'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cars
                </button>
                <button
                  onClick={() => setProductFilterTab('bike')}
                  className={`btn-bounce px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    productTab === 'bike'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bikes
                </button>
              </div>

              <Link
                to={productTab === 'all' ? '/products' : `/products?type=${productTab}`}
                className="hidden sm:flex text-xs font-bold text-red-600 hover:text-red-700 items-center gap-1 shrink-0 ml-2"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 animate-fade-up">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 animate-fade-up">
              {displayedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-4 text-center">
            <Link
              to={productTab === 'all' ? '/products' : `/products?type=${productTab}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <span>View All Spares →</span>
            </Link>
          </div>
        </section>
      )}

      {/* 4. Trusted Genuine Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
            Trusted Brands
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand_slug=${brand.slug}`}
              className="p-4 sm:p-5 rounded-3xl bg-white hover:bg-white border border-slate-200 hover:border-red-400 flex flex-col items-center justify-center text-center transition-all group shadow-card hover:shadow-card-hover"
            >
              <div className="h-10 flex items-center justify-center mb-2">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-h-8 max-w-[100px] object-contain group-hover:scale-105 transition-all"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Local Pudukkottai Store & Phone Helpline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-card relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Pudukkottai Store
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-white">
                Need Parts Advice? Talk to our Specialist
              </h3>
              <p className="text-xs text-slate-400">
                West Main Street, Pudukkottai • Mon - Sat: 9:00 AM - 9:00 PM
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <a
                href="tel:+918526613000"
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call 85266 13000</span>
              </a>
              <Link
                to="/products"
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>Browse Catalog →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
