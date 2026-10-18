import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Customer Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderDetails } from './pages/OrderDetails';
import { Account } from './pages/Account';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCompatibility } from './pages/admin/AdminCompatibility';
import { AdminVehicles } from './pages/admin/AdminVehicles';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';

import { ScrollToTopButton } from './components/ScrollToTopButton';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50">
          <div className="max-w-md p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Restoring session...</h2>
            <p className="text-xs text-slate-500 mb-4">Please refresh to continue.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Customer Layout with Header & Footer in White Theme
const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white antialiased">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-clip pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
        <VehicleProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Routes>
                  {/* Customer Website Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/car-parts" element={<Products defaultType="car" />} />
                    <Route path="/bike-parts" element={<Products defaultType="bike" />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/category/:categorySlug" element={<Products />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  {/* Admin Portal Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="compatibility" element={<AdminCompatibility />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </VehicleProvider>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
