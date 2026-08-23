import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Bike,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Zap,
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
      a: 'Yes. We source directly from official OE suppliers and certified aftermarket distributors including Bosch, Brembo, Philips, NGK, Denso, Motul, and Uno Minda. Every part comes with the original manufacturer warranty and tamper-proof packaging.'
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

      {/* 2. Shop by Vehicle Category Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Car Parts Banner Card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100/50 border border-red-200 p-6 sm:p-8 flex flex-col justify-between shadow-card hover:shadow-card-hover group transition-all duration-300">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white mb-3 shadow-sm">
                Cars & SUVs
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display mb-2">
                Automobile Spare Parts & Upgrades
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
                Brake pads, rotors, cabin AC filters, suspension struts, and high-intensity LED headlamps for Maruti Suzuki, Hyundai, Tata, Mahindra & Honda.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/car-parts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Browse Car Spares</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Car className="absolute -bottom-6 -right-6 w-44 h-44 text-red-600/5 group-hover:scale-110 group-hover:text-red-600/10 transition-all duration-500 pointer-events-none" />
          </div>

          {/* Bike Parts Banner Card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border border-amber-200 p-6 sm:p-8 flex flex-col justify-between shadow-card hover:shadow-card-hover group transition-all duration-300">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 mb-3 shadow-sm">
                Motorcycles & Superbikes
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display mb-2">
                Bike Performance Parts & Care
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
                Ceramic sintered brake pads, brass X-Ring drive chains, Motul 300V racing lubricants & Iridium spark plugs for Yamaha R15, Royal Enfield, KTM & Bajaj.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/bike-parts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Browse Bike Spares</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Bike className="absolute -bottom-6 -right-6 w-44 h-44 text-amber-500/5 group-hover:scale-110 group-hover:text-amber-500/10 transition-all duration-500 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore essential automotive maintenance & performance components
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category_slug=${cat.slug}`}
              className="group p-3 sm:p-4 rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-red-400 text-center flex flex-col items-center transition-all duration-300 shadow-card hover:shadow-card-hover"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 overflow-hidden mb-2.5 group-hover:scale-105 transition-transform flex items-center justify-center p-1 border border-slate-100">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=120'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1">
                {cat.name}
              </h4>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                Explore
              </span>
            </Link>
          ))}
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

      {/* 8. Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-red-600">Verified Testimonials</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-slate-900 mt-1">
            Loved by Drivers & Riders Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              "Finding the right brake pads for my 2022 Swift VXI was effortless with the vehicle selector. Received genuine Bosch pads in 2 days. Braking bite is phenomenal!"
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                RS
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Rajesh Sharma</h5>
                <p className="text-[10px] text-slate-500">Verified Buyer • Swift 2022 VXI</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              "Purchased Brembo sintered race pads and Motul 300V oil for my Yamaha R15 V4. 100% authentic. Zero brake fade on track days. Highly recommended!"
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-slate-950 shrink-0">
                AK
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Aditya Kapoor</h5>
                <p className="text-[10px] text-slate-500">Verified Buyer • Yamaha R15 V4</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              "Upgraded my Thar's headlamps to the Philips Ultinon LED bulbs. Highway night driving is now so much safer with the crisp cutoff beam. Seamless checkout!"
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                VS
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Vikram Singh</h5>
                <p className="text-[10px] text-slate-500">Verified Buyer • Thar LX Diesel</p>
              </div>
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
