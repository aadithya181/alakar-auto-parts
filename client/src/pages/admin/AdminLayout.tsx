import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Radio,
  ChevronRight,
  Sparkles,
  Bell,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, loading, login } = useAuth();
  const { showSuccess } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Live order telemetry & notification state
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);
  const prevOrderCountRef = useRef<number | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Poll for incoming orders every 10 seconds
  useEffect(() => {
    if (!isAdmin) return;

    const pollOrders = async () => {
      try {
        const res: any = await api.get('/admin/orders');
        if (res.success && Array.isArray(res.orders)) {
          const pending = res.orders.filter(
            (o: any) => o.order_status === 'pending' || o.payment_status === 'paid' || o.order_status === 'confirmed'
          );
          setPendingOrdersCount(pending.length);
          setRecentOrders(res.orders.slice(0, 5));

          // Trigger live toast alert if new order arrives
          if (prevOrderCountRef.current !== null && res.orders.length > prevOrderCountRef.current) {
            const newest = res.orders[0];
            showSuccess(`🔔 New Order! #${newest.order_number} by ${newest.customer_name || 'Customer'} for ₹${Number(newest.total_amount).toLocaleString('en-IN')}`);
          }
          prevOrderCountRef.current = res.orders.length;
        }
      } catch (err) {
        // Silent background polling
      }
    };

    pollOrders();
    const interval = setInterval(pollOrders, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleQuickAdminLogin = async () => {
    try {
      setLoggingIn(true);
      await login('admin@newalagarautoparts.com', 'admin123');
    } catch (err: any) {
      alert('Login failed: ' + (err.message || 'Error'));
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <span className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-5 text-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
              Administrative Access Required
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              New Alagar Auto Parts operations console. You must authenticate as an authorized administrator to manage inventory and fulfillment.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleQuickAdminLogin}
              disabled={loggingIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loggingIn ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                '⚡ One-Click Admin Sign In'
              )}
            </button>

            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-block border border-slate-200"
            >
              Go to Standard Login Page
            </Link>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Admin Credentials:</div>
            <div>📧 Email: <span className="font-mono text-red-600 font-bold">admin@newalagarautoparts.com</span></div>
            <div>🔑 Password: <span className="font-mono text-red-600 font-bold">admin123</span></div>
          </div>
        </div>
      </div>
    );
  }

  const navSections = [
    {
      group: 'OPERATIONS & INVENTORY',
      items: [
        { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Products & Catalog', path: '/admin/products', icon: Package },
        { label: 'Vehicle Compatibility', path: '/admin/compatibility', icon: Wrench },
        { label: 'Vehicle Directory', path: '/admin/vehicles', icon: Car },
      ],
    },
    {
      group: 'FULFILLMENT & CUSTOMERS',
      items: [
        { label: 'Orders & Dispatch', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers Registry', path: '/admin/customers', icon: Users },
        { label: 'Discount Coupons', path: '/admin/coupons', icon: Tag },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-sm text-slate-900 font-display">NEW ALAGAR<span className="text-red-600 ml-1">ADMIN</span></span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pudukkottai Hub</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar - Clean White Theme */}
      <aside className={`w-full md:w-64 bg-white border-r border-slate-200 p-5 flex-col justify-between shrink-0 shadow-sm ${
        sidebarOpen ? 'flex' : 'hidden md:flex'
      }`}>
        <div>
          {/* Logo & Admin Status Header */}
          <div className="hidden md:flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black font-display text-slate-900 tracking-tight leading-none block">
                NEW ALAGAR
              </span>
              <span className="text-xs font-black font-display text-red-600 uppercase tracking-wider block mt-0.5">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          {/* Live Telemetry Pill */}
          <div className="hidden md:flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PUDUKKOTTAI HUB</span>
            </span>
            <span className="text-slate-500 font-mono">LIVE</span>
          </div>

          {/* Navigation Links Grouped */}
          <div className="space-y-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {section.group}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-600'} transition-colors`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase animate-pulse shadow-2xs ${
                            isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                          }`}>
                            {pendingOrdersCount} NEW
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer User Session Card */}
        <div className="pt-5 mt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
              SR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">Surendar</p>
              <p className="text-[10px] text-slate-500 font-medium">Store Operator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3 text-slate-500" />
              <span>Storefront</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Operational Bar with Live Alert Bell */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>New Alagar Auto Parts • Operations Console</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">Pudukkottai Central Warehouse</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Live Order Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-red-600" />
                      Live Incoming Orders
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                      {pendingOrdersCount} Pending
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {recentOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No orders received yet.</p>
                    ) : (
                      recentOrders.map((ord: any) => (
                        <div key={ord.id} className="pt-2 flex items-start justify-between gap-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-900">
                              #{ord.order_number} • ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                            </p>
                            <p className="text-[11px] text-slate-600">{ord.customer_name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.payment_status || 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    to="/admin/orders"
                    onClick={() => setShowNotificationMenu(false)}
                    className="block text-center w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
                  >
                    View All Orders & Dispatch →
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Storefront link */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Storefront</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
