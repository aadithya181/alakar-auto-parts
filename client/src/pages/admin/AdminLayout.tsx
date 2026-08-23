import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingBag,
  Users,
  Tag,
  Car,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, loading, login } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const handleQuickAdminLogin = async () => {
    try {
      setLoggingIn(true);
      await login('admin@alakarautoparts.com', 'admin123');
    } catch (err: any) {
      alert('Login failed: ' + (err.message || 'Error'));
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <span className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Administrative Access Required</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You need to be logged in with an administrator account to view and manage the store portal.
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleQuickAdminLogin}
              disabled={loggingIn}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loggingIn ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                '⚡ One-Click Admin Sign In'
              )}
            </button>

            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-block"
            >
              Go to Standard Login Page
            </Link>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Admin Demo Credentials:</div>
            <div>📧 Email: <span className="font-mono text-slate-800 font-bold">admin@alakarautoparts.com</span></div>
            <div>🔑 Password: <span className="font-mono text-slate-800 font-bold">admin123</span></div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Compatibility Matrix', path: '/admin/compatibility', icon: Wrench },
    { label: 'Vehicles', path: '/admin/vehicles', icon: Car },
    { label: 'Orders & Dispatch', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Car className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900">ALAKAR<span className="text-red-600 ml-1">ADMIN</span></span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside className={`w-full md:w-64 bg-white border-r border-slate-200 p-5 flex-col justify-between shrink-0 ${
        sidebarOpen ? 'flex' : 'hidden md:flex'
      }`}>
        <div>
          {/* Logo & Admin Tag */}
          <div className="hidden md:flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black font-display text-slate-900">ALAKAR<span className="text-red-600 ml-1">ADMIN</span></span>
              <span className="block text-[9px] uppercase font-bold text-amber-600 -mt-1">Pudukkottai Store</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
