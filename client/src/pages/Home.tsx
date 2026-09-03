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
} from 'lucide-react';
import { VehicleSelector } from '../components/VehicleSelector';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { Product, Category, Brand } from '../types';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [carProducts, setCarProducts] = useState<Product[]>([]);
  const [bikeProducts, setBikeProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, carRes, bikeRes, catRes, brandRes]: any[] = await Promise.all([
          api.get('/products', { params: { limit: 4, featured: true } }),
          api.get('/products', { params: { limit: 4, vehicle_type: 'car' } }),
          api.get('/products', { params: { limit: 4, vehicle_type: 'bike' } }),
          api.get('/categories'),
          api.get('/brands', { params: { featured: true } }),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (carRes.success) setCarProducts(carRes.products || []);
        if (bikeRes.success) setBikeProducts(bikeRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (brandRes.success) setBrands(brandRes.brands || []);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const faqs = [
    {
      q: 'How does the Vehicle Compatibility Finder guarantee the part will fit?',
      a: 'Our database maps each SKU directly to specific vehicle variant generations, engine capacities, and manufacturing year ranges. When you select your vehicle, our system filters out incompatible parts and highlights verified direct-fit components.'
    },
    {
      q: 'Are all products sold on Alakar Auto Parts 100% genuine?',
      a: 'Yes. We source directly from official manufacturers and certified distributors including 5M Auto Care Products, WOW SONAL, LIU HJG, ProTaper, and Philips Automotive. Every item comes with manufacturer warranty and authentic packaging.'
    },
    {
      q: 'What is your shipping time and return policy?',
      a: 'Orders above ₹999 qualify for Free Express Shipping. Most metro orders are delivered within 48 to 72 hours. We also offer a hassle-free 7-day vehicle fitment replacement guarantee.'
    },
    {
      q: 'Can I pay online using UPI, Cards or Netbanking?',
      a: 'Yes. We use 100% secure Razorpay payment processing supporting all major credit/debit cards, UPI (GPay, PhonePe, Paytm), Netbanking, and EMI.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 pt-6 sm:pt-10 pb-12 sm:pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-600" /> India's Precision Automotive Parts Hub
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-900 leading-tight">
              Everything Your <span className="text-red-600">Vehicle Needs</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find genuine spare parts and accessories for cars and bikes with guaranteed vehicle-specific compatibility and express delivery across India.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/car-parts"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Car className="w-4 h-4" /> Shop Car Parts
              </Link>
              <Link
                to="/bike-parts"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <Bike className="w-4 h-4" /> Shop Bike Parts
              </Link>
            </div>
          </div>

          {/* Prominent Vehicle Selector Widget */}
          <VehicleSelector />
        </div>
      </section>

      {/* 2. Shop by Vehicle Quick Cards (Bike, Auto, Car, Van) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bike */}
          <Link
            to="/products?type=bike"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 w-fit border border-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
                <Bike className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-display">Bike / 2 Wheeler</h3>
              <p className="text-[11px] text-slate-500 mt-1">Horns, Fog Lights, LED bulbs, Grips & Spares</p>
            </div>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-3">
              Explore Bike Spares →
            </span>
          </Link>

          {/* Auto */}
          <Link
            to="/products?type=auto"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-slate-900 border border-slate-800 hover:border-yellow-500/50 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 w-fit border border-yellow-500/20 mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-display">Auto / 3 Wheeler</h3>
              <p className="text-[11px] text-slate-500 mt-1">AC/DC Horns, Fog Lights, Headlamp Bulbs & Fancy LEDs</p>
            </div>
            <span className="text-[11px] font-bold text-yellow-600 flex items-center gap-1 mt-3">
              Explore Auto Spares →
            </span>
          </Link>

          {/* Car */}
          <Link
            to="/products?type=car"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-red-600/10 via-red-600/5 to-slate-900 border border-slate-800 hover:border-red-500/50 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500 w-fit border border-red-600/20 mb-3 group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-display">Car Parts</h3>
              <p className="text-[11px] text-slate-500 mt-1">Windtone Horns, Projector Fog Lights & Plate Frames</p>
            </div>
            <span className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-3">
              Explore Car Parts →
            </span>
          </Link>

          {/* Van */}
          <Link
            to="/products?type=van"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 w-fit border border-blue-600/20 mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-display">Van / Commercial</h3>
              <p className="text-[11px] text-slate-500 mt-1">3-Pipe Musical Air Horns, Coach Lights & Heavy Brackets</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-3">
              Explore Van Spares →
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Product Departments Matrix (LIGHTS, ACCESSORIES, HORN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Product Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browse by Lights, Horns and Accessories tailored for Bike, Auto, Car & Van
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department 1: LIGHTS */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:border-amber-400 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black font-display text-slate-900">LIGHTS</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  4 Subgroups
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {/* 1. Fog Lights */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">1. Fog Lights</span>
                  <div className="grid grid-cols-4 gap-1">
                    <Link to="/products?category_slug=bike-fog-lights" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Bike</Link>
                    <Link to="/products?category_slug=auto-fog-lights" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Auto</Link>
                    <Link to="/products?category_slug=car-fog-lights" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Car</Link>
                    <Link to="/products?category_slug=van-fog-lights" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Van</Link>
                  </div>
                </div>

                {/* 2. Head Light Bulbs */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">2. Head Light Bulbs</span>
                  <div className="grid grid-cols-4 gap-1">
                    <Link to="/products?category_slug=bike-head-light-bulbs" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Bike</Link>
                    <Link to="/products?category_slug=auto-head-light-bulbs" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Auto</Link>
                    <Link to="/products?category_slug=car-head-light-bulbs" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Car</Link>
                    <Link to="/products?category_slug=van-head-light-bulbs" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Van</Link>
                  </div>
                </div>

                {/* 3. Fancy LED */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">3. Fancy LED</span>
                  <div className="grid grid-cols-4 gap-1">
                    <Link to="/products?category_slug=bike-fancy-led" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Bike</Link>
                    <Link to="/products?category_slug=auto-fancy-led" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Auto</Link>
                    <Link to="/products?category_slug=car-fancy-led" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Car</Link>
                    <Link to="/products?category_slug=van-fancy-led" className="px-2 py-1 rounded-lg bg-white hover:bg-red-600 hover:text-white text-[11px] font-semibold text-center border border-slate-200 transition-colors">Van</Link>
                  </div>
                </div>

                {/* 4. Coach Lights */}
                <Link
                  to="/products?category_slug=coach-lights"
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <span className="text-xs font-bold text-amber-900">4. Coach Lights (Van / Coach / Bus)</span>
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </Link>
              </div>
            </div>
          </div>

          {/* Department 2: ACCESSORIES */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:border-blue-400 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black font-display text-slate-900">ACCESSORIES</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  3 Subgroups
                </span>
              </div>

              <div className="space-y-3 mt-4">
                <Link
                  to="/products?category_slug=bike-accessories"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">1. Bike Accessories</span>
                    <span className="text-[10px] text-slate-500">ProTaper grips, handlebar controls & styling</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </Link>

                <Link
                  to="/products?category_slug=car-accessories"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">2. Car Accessories</span>
                    <span className="text-[10px] text-slate-500">HSRP number plate frames & utility items</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </Link>

                <Link
                  to="/products?category_slug=van-accessories"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">3. Van Accessories</span>
                    <span className="text-[10px] text-slate-500">Commercial brackets, plate frames & utility</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Department 3: HORN */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card hover:border-red-400 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black font-display text-slate-900">HORN</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  4 Subgroups
                </span>
              </div>

              <div className="space-y-3 mt-4">
                <Link
                  to="/products?category_slug=bike-horns"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-700 block">1. Bike Horns</span>
                    <span className="text-[10px] text-slate-500">5M Single 110dB, WOW SONAL XL AC/DC</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </Link>

                <Link
                  to="/products?category_slug=auto-horns"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-700 block">2. Auto Horns</span>
                    <span className="text-[10px] text-slate-500">12V loud disc horns for 3-Wheelers</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </Link>

                <Link
                  to="/products?category_slug=car-horns"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-700 block">3. Car Horns</span>
                    <span className="text-[10px] text-slate-500">5M Windtone 112dB German tech horn pairs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </Link>

                <Link
                  to="/products?category_slug=van-horns"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-700 block">4. Van Horns</span>
                    <span className="text-[10px] text-slate-500">5M 3-Pipe musical air horn with compressor</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Car Parts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                Popular Car Parts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Top rated replacement parts for Maruti, Hyundai, Tata & Mahindra
              </p>
            </div>
          </div>
          <Link
            to="/car-parts"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {carProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. Popular Bike Parts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                Popular Motorcycle Parts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                High-friction brake pads, racing oils & drive chain sets
              </p>
            </div>
          </div>
          <Link
            to="/bike-parts"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bikeProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Featured Genuine Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600">Authorized Partners</span>
          <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 mt-1">
            Shop by Trusted Automotive Brands
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-2">
            World-class OE tier-1 manufacturers engineered to the highest safety and performance standards.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand_slug=${brand.slug}`}
              className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-red-400 flex flex-col items-center justify-center text-center transition-all group shadow-card hover:shadow-card-hover"
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-red-600">The Alakar Auto Parts Difference</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-slate-900 mt-1">
              Why Mechanics & Automobile Enthusiasts Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Relational Vehicle Fitment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero guesswork. Select your exact vehicle variant to discover verified parts that fit like factory original.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">100% Genuine OE Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every brake pad, spark plug, and lubricant comes with official barcode tracking, tamper seals, and warranties.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Express India-wide Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast warehouse processing with real-time order tracking and express courier logistics to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Everything you need to know about our vehicle compatibility and orders
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5">
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

      {/* 9. Contact/Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-card">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-200">Get in Touch</span>
            <h3 className="text-lg sm:text-xl font-black text-white font-display mt-0.5">
              Need help finding the right part?
            </h3>
            <p className="text-xs text-red-100 mt-1">
              Call us at <span className="font-bold text-amber-300">+91 85266 13000</span> &nbsp;|&nbsp; Pudukkottai, Tamil Nadu
            </p>
          </div>
          <a
            href="tel:+918526613000"
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-red-600 text-sm font-black shadow-sm hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
          >
            📞 Call Now
          </a>
        </div>
      </section>
    </div>
  );
};
