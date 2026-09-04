import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Bike,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Zap,
  Wrench,
  Phone,
  MapPin,
  Clock,
  Search,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { Product, Category, Brand } from '../types';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [carProducts, setCarProducts] = useState<Product[]>([]);
  const [bikeProducts, setBikeProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'lights' | 'horns' | 'accessories'>('all');
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
      title: 'Bike / 2-Wheelers',
      badge: 'Motorcycles & Scooters',
      desc: 'High-power fog lights, 12V horns, LED headlight conversion bulbs & ProTaper grips',
      link: '/products?type=bike',
      icon: Bike,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      accentColor: 'text-amber-600',
    },
    {
      title: 'Auto / 3-Wheelers',
      badge: 'Bajaj RE, Ape, TVS',
      desc: 'AC/DC loud disc horns, auxiliary driving lamps, 12V headlamp bulbs & fancy LEDs',
      link: '/products?type=auto',
      icon: Zap,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      accentColor: 'text-emerald-600',
    },
    {
      title: 'Car / 4-Wheelers',
      badge: 'Hatchbacks, Sedans & SUVs',
      desc: '5M Windtone horn pairs, projector bumper fog lamps & HSRP number plate frames',
      link: '/products?type=car',
      icon: Car,
      iconColor: 'text-red-600 bg-red-50 border-red-200',
      hoverBorder: 'hover:border-red-400',
      accentColor: 'text-red-600',
    },
    {
      title: 'Van & Commercial',
      badge: 'Pickups, Vans & Buses',
      desc: '5M 3-pipe musical air horns with compressor, coach lights & heavy mounting brackets',
      link: '/products?type=van',
      icon: Truck,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      accentColor: 'text-blue-600',
    },
  ];

  const curatedCategories = [
    {
      id: 'fog-lights',
      tab: 'lights',
      title: 'Fog Lights & Projector Pods',
      desc: 'Dual beam yellow/white auxiliary lights, bumper projector pods for highway safety.',
      vehicles: 'Bikes • Autos • Cars • Vans',
      link: '/products?category_slug=bike-fog-lights',
      tag: 'Lighting',
      icon: Zap,
      color: 'amber',
    },
    {
      id: 'headlight-bulbs',
      tab: 'lights',
      title: 'Headlight Conversion Bulbs',
      desc: 'Ultra-bright H4, HS1, and H7 pure-white LED and premium halogen headlamp bulbs.',
      vehicles: 'Universal Fitment',
      link: '/products?category_slug=car-head-light-bulbs',
      tag: 'Lighting',
      icon: Zap,
      color: 'amber',
    },
    {
      id: 'coach-lights',
      tab: 'lights',
      title: 'Coach & Heavy Duty Lights',
      desc: 'Roof marker lights, side indicator pods, and cabin lights for vans and commercial buses.',
      vehicles: 'Vans • Coaches • Pickups',
      link: '/products?category_slug=coach-lights',
      tag: 'Commercial',
      icon: Truck,
      color: 'blue',
    },
    {
      id: 'windtone-horns',
      tab: 'horns',
      title: 'Windtone Trumpet Horns',
      desc: 'German technology 112dB harmonic dual-tone car horn sets with heavy sound output.',
      vehicles: 'Cars • SUVs • Vans',
      link: '/products?category_slug=car-horns',
      tag: 'Warning',
      icon: Zap,
      color: 'red',
    },
    {
      id: 'disc-horns',
      tab: 'horns',
      title: 'High-Decibel Disc Horns',
      desc: '12V compact disc horns engineered for loud city penetration on bikes and autos.',
      vehicles: 'Bikes • Autos',
      link: '/products?category_slug=bike-horns',
      tag: 'Warning',
      icon: Zap,
      color: 'red',
    },
    {
      id: 'musical-horns',
      tab: 'horns',
      title: '3-Pipe Musical Air Horns',
      desc: 'Heavy duty 5M musical air horns complete with 12V high-output electric air compressor.',
      vehicles: 'Vans • Heavy Commercial',
      link: '/products?category_slug=van-horns',
      tag: 'Commercial',
      icon: Truck,
      color: 'blue',
    },
    {
      id: 'handlebar-grips',
      tab: 'accessories',
      title: 'Performance Handlebar Grips',
      desc: 'ProTaper soft-compound dual-density grips offering superior vibration dampening.',
      vehicles: 'All Motorcycles & Scooters',
      link: '/products?category_slug=bike-accessories',
      tag: 'Accessories',
      icon: Wrench,
      color: 'slate',
    },
    {
      id: 'plate-frames',
      tab: 'accessories',
      title: 'HSRP Number Plate Frames',
      desc: 'Anti-rattle ABS plastic license plate holders for Maruti, Hyundai, Tata & bikes.',
      vehicles: 'Cars & Two-Wheelers',
      link: '/products?category_slug=car-accessories',
      tag: 'Accessories',
      icon: Wrench,
      color: 'slate',
    },
  ];

  const filteredCategories = activeCategoryTab === 'all'
    ? curatedCategories
    : curatedCategories.filter((c) => c.tab === activeCategoryTab);

  const faqs = [
    {
      q: 'How does the Vehicle Compatibility Finder guarantee the part will fit?',
      a: 'Our database maps each SKU directly to specific vehicle variant generations, engine capacities, and manufacturing year ranges. When you select your vehicle, our system filters out incompatible parts and highlights verified direct-fit components.'
    },
    {
      q: 'Are all products sold on New Alagar Auto Parts 100% genuine?',
      a: 'Yes. We source directly from official manufacturers and certified distributors including 5M Auto Care Products, WOW SONAL, LIU HJG, ProTaper, and Philips Automotive. Every item comes with manufacturer warranty and authentic packaging.'
    },
    {
      q: 'What is your shipping time and return policy?',
      a: 'Orders above ₹999 qualify for Free Express Shipping. Most metro orders are delivered within 48 to 72 hours. We also offer a hassle-free 7-day vehicle fitment replacement guarantee.'
    },
    {
      q: 'Can I visit the New Alagar Auto Parts store in Pudukkottai?',
      a: 'Absolutely! Our store is located on West Main Street, Old GH Road (Near Murugan Kovil), Pudukkottai, Tamil Nadu. You can also call Surendar directly at +91 85266 13000 for part enquiries and immediate pickup.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-slate-50 pt-10 sm:pt-16 pb-12 sm:pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>100% Genuine Spare Parts • Pudukkottai Store</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-slate-900 leading-tight">
              Precision Auto Parts, <br className="hidden sm:inline" />
              <span className="text-red-600">Guaranteed to Fit.</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find verified OE replacement parts and premium accessories for two-wheelers, three-wheelers, cars, and commercial vans with guaranteed compatibility and fast doorstep dispatch.
            </p>

            {/* Clean Hero Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-red-600/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Browse All Spares →</span>
              </Link>
              <Link
                to="/products?type=bike"
                className="px-4 sm:px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Bike className="w-4 h-4 text-amber-600" />
                <span>Bike Parts</span>
              </Link>
              <Link
                to="/products?type=car"
                className="px-4 sm:px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Car className="w-4 h-4 text-red-600" />
                <span>Car Parts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Vehicle Quick Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Select Your Vehicle Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore dedicated spares and accessories crafted for each vehicle class.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {vehicleQuickCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className={`group p-5 rounded-3xl bg-white border border-slate-200 ${card.hoverBorder} shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2.5 rounded-2xl border ${card.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 font-display group-hover:text-red-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className={card.accentColor}>Browse Catalog</span>
                  <ArrowRight className={`w-4 h-4 ${card.accentColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Curated Product Categories (User-Centric Redesign) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Popular Product Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              High-demand automotive lighting, horns, relays, and utility styling
            </p>
          </div>

          {/* Clean Category Filter Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto gap-1">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategoryTab('lights')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'lights'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lighting
            </button>
            <button
              onClick={() => setActiveCategoryTab('horns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'horns'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horns
            </button>
            <button
              onClick={() => setActiveCategoryTab('accessories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'accessories'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accessories
            </button>
          </div>
        </div>

        {/* Curated Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.link}
                className="group p-5 rounded-3xl bg-white border border-slate-200 hover:border-red-400 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.vehicles}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
                  <span>View Products</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Store Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                  Featured Spares & Bestsellers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Hand-picked, high-reliability parts ready for immediate dispatch
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Popular Car Parts */}
      {carProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                  Popular Car Spares
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Windtone horn pairs, bumper projector fog lamps, number plate frames
                </p>
              </div>
            </div>
            <Link
              to="/products?type=car"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {carProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Popular Bike Parts */}
      {bikeProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                  Popular Two-Wheeler Spares
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  9-LED fog lights, loud disc horns, performance handlebar grips & bulbs
                </p>
              </div>
            </div>
            <Link
              to="/products?type=bike"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {bikeProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Featured Genuine Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600">Authorized Partners</span>
          <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 mt-1">
            Shop by Trusted Automotive Brands
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-2">
            Top tier automotive manufacturers certified for high durability, performance and authentic packaging.
          </p>
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

      {/* 8. Trust & Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-red-600">
              The New Alagar Auto Parts Promise
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-slate-900 mt-1">
              Built for Mechanics, Enthusiasts & Daily Drivers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Relational Vehicle Fitment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero guesswork. Select your exact vehicle variant to discover verified components that fit factory specifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">100% Genuine OE Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every horn, projector light, and accessory carries official serial numbers, warranty support, and tamper seals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Express Doorstep Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Swift dispatch from our Pudukkottai hub with live order tracking and verified express logistics across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Answers to vehicle fitment, genuine guarantees, and order fulfillment
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2.5 mb-1.5">
                <HelpCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Local Pudukkottai Store & Phone Helpline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-card relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Pudukkottai Store & Parts Desk
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-white">
                Visit Us or Call for Immediate Fitment Assistance
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                West Main Street, Old GH Road (Near Murugan Kovil), Pudukkottai, Tamil Nadu. Talk directly with Surendar for custom vehicle recommendations.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Mon - Sat: 9:00 AM - 9:00 PM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-400" /> +91 85266 13000
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="tel:+918526613000"
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call +91 85266 13000</span>
              </a>
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>Browse All Spares →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
