import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, Car, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs pb-16 md:pb-0">
      {/* Top Value Propositions */}
      <div className="border-b border-slate-100 py-6 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">100% Genuine</h4>
                <p className="text-slate-500 text-[10px] hidden sm:block">OE manufacturers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Fast Shipping</h4>
                <p className="text-slate-500 text-[10px] hidden sm:block">48hr dispatch</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">7-Day Returns</h4>
                <p className="text-slate-500 text-[10px] hidden sm:block">Fitment guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Expert Support</h4>
                <p className="text-slate-500 text-[10px] hidden sm:block">Parts specialist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Brand Column */}
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-display tracking-tight text-slate-900">
                ALAKAR<span className="text-red-600 ml-1">AUTO PARTS</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed mb-4 text-[11px] max-w-sm">
              Your trusted partner for 100% genuine automobile and motorcycle spare parts, engine oils, brake components, and vehicle accessories in Pudukkottai.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-red-600" /> <span className="font-semibold text-slate-700">Surendar:</span> +91 85266 13000</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-red-600" /> support@alakarautoparts.com</p>
              <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" /> West Main Street, Old GH Road, Near Murugan Kovil, Pudukkottai</p>
            </div>
          </div>

          {/* Popular Car Parts */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Car Parts</h5>
            <ul className="space-y-2">
              <li><Link to="/products?category_slug=car-brake-parts" className="hover:text-red-600 transition-colors text-[11px]">Brake Pads & Rotors</Link></li>
              <li><Link to="/products?category_slug=car-filters" className="hover:text-red-600 transition-colors text-[11px]">AC & Air Filters</Link></li>
              <li><Link to="/products?category_slug=car-lighting" className="hover:text-red-600 transition-colors text-[11px]">LED Headlamps</Link></li>
              <li><Link to="/products?category_slug=car-suspension" className="hover:text-red-600 transition-colors text-[11px]">Shock Absorbers</Link></li>
              <li><Link to="/products?category_slug=car-engine-parts" className="hover:text-red-600 transition-colors text-[11px]">Spark Plugs</Link></li>
            </ul>
          </div>

          {/* Popular Bike Parts */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Bike Parts</h5>
            <ul className="space-y-2">
              <li><Link to="/products?category_slug=bike-brake-parts" className="hover:text-red-600 transition-colors text-[11px]">Brake Pads</Link></li>
              <li><Link to="/products?category_slug=bike-chain-sprocket" className="hover:text-red-600 transition-colors text-[11px]">Chain Kits</Link></li>
              <li><Link to="/products?category_slug=bike-engine-lubricants" className="hover:text-red-600 transition-colors text-[11px]">Engine Oils</Link></li>
              <li><Link to="/products?category_slug=bike-engine-lubricants" className="hover:text-red-600 transition-colors text-[11px]">Spark Plugs</Link></li>
              <li><Link to="/products?category_slug=bike-care-accessories" className="hover:text-red-600 transition-colors text-[11px]">Chain Lube Combo</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Support</h5>
            <ul className="space-y-2">
              <li><Link to="/account" className="hover:text-red-600 transition-colors text-[11px]">My Garage</Link></li>
              <li><Link to="/account?tab=orders" className="hover:text-red-600 transition-colors text-[11px]">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-red-600 transition-colors text-[11px]">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-red-600 transition-colors text-[11px]">Wishlist</Link></li>
              <li><Link to="/admin" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors text-[11px]">Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Alakar Auto Parts (Surendar). Pudukkottai, Tamil Nadu. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Vehicle Compatibility Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
