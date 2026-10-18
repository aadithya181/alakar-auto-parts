import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  MapPin,
  Plus,
  Check,
  Lock,
  ExternalLink,
  ShieldCheck,
  Truck,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  LogIn,
  UserPlus,
  Phone,
  Mail,
  Store,
  Sparkles,
  AlertCircle,
  QrCode,
  Smartphone,
  Copy,
  X,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import api from '../services/api';
import { Address } from '../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user, token, login, register, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Authentication inline state (Step 1)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // Address state (Step 2)
  // Address state (Step 2) with instant local cache for returning purchases
  const [addresses, setAddresses] = useState<Address[] | any[]>(() => {
    try {
      const saved = localStorage.getItem('torq_saved_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('torq_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const def = parsed.find((a: any) => a.is_default) || parsed[0];
          return def.id;
        }
      }
    } catch {}
    return '';
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('torq_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !(Array.isArray(parsed) && parsed.length > 0);
      }
    } catch {}
    return true;
  });

  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [savingAddress, setSavingAddress] = useState<boolean>(false);

  // New Address Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    area: '',
    city: 'Pudukkottai',
    state: 'Tamil Nadu',
    pincode: '622001',
    landmark: '',
    is_default: true,
  });

  // Payment state (Step 3)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  const couponCode = (location.state as any)?.couponCode || null;

  // Sync user info into address form when user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Fetch saved customer addresses and sync local cache
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        try {
          setLoadingAddresses(true);
          const res: any = await api.get('/addresses', { params: { user_id: user.id } });
          if (res.success && res.addresses && res.addresses.length > 0) {
            setAddresses(res.addresses);
            try {
              localStorage.setItem('torq_saved_addresses', JSON.stringify(res.addresses));
            } catch (e) {}

            const defaultAddr = res.addresses.find((a: any) => a.is_default) || res.addresses[0];
            setSelectedAddressId((prev) => prev || defaultAddr.id);
            setShowNewAddressForm(false);
          } else if (addresses.length === 0) {
            setShowNewAddressForm(true);
          }
        } catch (err: any) {
          console.warn('Could not fetch addresses:', err.message);
          if (addresses.length === 0) {
            setShowNewAddressForm(true);
          }
        } finally {
          setLoadingAddresses(false);
        }
      };
      fetchAddresses();
    }
  }, [user, token]);

  // Automatically select the default or first address whenever addresses exist
  useEffect(() => {
    if (addresses.length > 0) {
      const match = addresses.find((a: any) => String(a.id) === String(selectedAddressId));
      if (!selectedAddressId || !match) {
        const def = addresses.find((a: any) => a.is_default) || addresses[0];
        if (def && def.id) {
          setSelectedAddressId(def.id);
        }
      }
    }
  }, [addresses, selectedAddressId]);

  // Ensure cart is not empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  // Inline Sign-In Handler
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    try {
      setSubmittingAuth(true);
      await login(authEmail.trim(), authPassword);
      showSuccess('Signed in successfully! Please confirm your delivery address.');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password.');
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Inline Quick Register Handler
  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authEmail.trim() || !authPassword) {
      setAuthError('Please enter your name, email, and a secure password.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmittingAuth(true);
      await register(authName.trim(), authEmail.trim(), authPassword, authPhone.trim());
      showSuccess('Account created! Welcome to New Alagar Auto Parts.');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      showError(err.message || 'Registration failed.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Handle Pincode Auto-Fill
  const handlePincodeChange = (pin: string) => {
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    let newCity = formData.city;
    let newState = formData.state;

    if (cleanPin.startsWith('622')) {
      newCity = 'Pudukkottai';
      newState = 'Tamil Nadu';
    } else if (cleanPin.startsWith('620') || cleanPin.startsWith('621')) {
      newCity = 'Tiruchirappalli';
      newState = 'Tamil Nadu';
    } else if (cleanPin.startsWith('600')) {
      newCity = 'Chennai';
      newState = 'Tamil Nadu';
    } else if (cleanPin.startsWith('641')) {
      newCity = 'Coimbatore';
      newState = 'Tamil Nadu';
    } else if (cleanPin.startsWith('625')) {
      newCity = 'Madurai';
      newState = 'Tamil Nadu';
    } else if (cleanPin.startsWith('560')) {
      newCity = 'Bengaluru';
      newState = 'Karnataka';
    }

    setFormData({
      ...formData,
      pincode: cleanPin,
      city: newCity,
      state: newState,
    });
  };

  // Save Delivery Address (Step 2)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.state || !formData.pincode) {
      showError('Please fill in all mandatory address fields.');
      return;
    }

    if (!user) {
      showError('Please sign in first in Step 1 to save your address.');
      return;
    }

    try {
      setSavingAddress(true);
      const res: any = await api.post('/addresses', {
        ...formData,
        user_id: user.id,
      });

      const savedAddr = (res && res.success && res.address) ? res.address : {
        id: 'addr-' + Date.now(),
        user_id: user.id,
        ...formData,
        is_default: true,
      };

      const updated = [savedAddr, ...addresses.filter((a: any) => a.id !== savedAddr.id)];
      setAddresses(updated);
      setSelectedAddressId(savedAddr.id);
      setShowNewAddressForm(false);
      try {
        localStorage.setItem('torq_saved_addresses', JSON.stringify(updated));
      } catch (e) {}
      showSuccess('Delivery address saved! You can now proceed to payment.');
    } catch (err: any) {
      // Graceful local persistence fallback
      const localAddr = {
        id: 'addr-local-' + Date.now(),
        user_id: user?.id || 'usr-1',
        ...formData,
        is_default: true,
      };
      const updated = [localAddr, ...addresses];
      setAddresses(updated);
      setSelectedAddressId(localAddr.id);
      setShowNewAddressForm(false);
      try {
        localStorage.setItem('torq_saved_addresses', JSON.stringify(updated));
      } catch (e) {}
      showSuccess('Delivery address saved to profile.');
    } finally {
      setSavingAddress(false);
    }
  };

  const getActiveShippingAddress = () => {
    if (selectedAddressId) {
      const addr = addresses.find((a: any) => String(a.id) === String(selectedAddressId));
      if (addr) return addr;
    }
    if (addresses.length > 0) {
      return addresses.find((a: any) => a.is_default) || addresses[0];
    }
    return null;
  };

  // Helper to dynamically ensure Razorpay checkout script is loaded
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        setTimeout(() => resolve(Boolean(window.Razorpay)), 1000);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayModal = (internalOrder: any, paymentRes: any, shippingAddress: any) => {
    if (!window.Razorpay) {
      setProcessingPayment(false);
      showError('Razorpay payment gateway could not be loaded. Please check your internet connection.');
      return;
    }

    try {
      const options: any = {
        key: paymentRes.keyId,
        amount: paymentRes.amountInPaise,
        currency: paymentRes.currency || 'INR',
        name: 'New Alagar Auto Parts',
        description: `Order #${internalOrder.orderNumber}`,
        order_id: paymentRes.razorpayOrderId,
        prefill: {
          name: shippingAddress.full_name,
          email: user?.email || shippingAddress.email || 'customer@alagarautoparts.com',
          contact: shippingAddress.phone,
          method: paymentMethod === 'upi' ? 'upi' : undefined,
        },
        theme: {
          color: '#dc2626',
        },
        handler: async (response: any) => {
          await verifyAndCompleteOrder(
            internalOrder.orderId || internalOrder.id,
            response.razorpay_order_id || paymentRes.razorpayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: async () => {
            setProcessingPayment(false);
            showInfo('Payment was not completed. Your items are saved in your cart.');
            try {
              await api.post('/orders/cleanup-draft', {
                order_id: internalOrder.orderId || internalOrder.id,
              });
            } catch (e) {}
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response: any) => {
        setProcessingPayment(false);
        showError(`Payment Failed: ${response.error?.description || 'Declined by bank. Please try again.'}`);
        try {
          await api.post('/orders/cleanup-draft', {
            order_id: internalOrder.orderId || internalOrder.id,
          });
        } catch (e) {}
      });

      rzp.open();
      setProcessingPayment(false);
    } catch (err: any) {
      setProcessingPayment(false);
      showError(err.message || 'Failed to open Razorpay payment window');
    }
  };

  // COMPLETE PAYMENT FLOW (REAL RAZORPAY GATEWAY OR COD)
  const handleProceedToPayment = async () => {
    if (!user) {
      showError('Please sign in or register in Step 1 first.');
      const el = document.getElementById('checkout-step-1');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const rawAddress: any = getActiveShippingAddress();

    if (!rawAddress || !rawAddress.full_name || !rawAddress.address_line_1) {
      showError('Please save or select your delivery address in Step 2.');
      const el = document.getElementById('checkout-step-2');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const shippingAddress = {
      ...rawAddress,
      phone: rawAddress.phone || user?.phone || '8526613000',
    };

    if (shippingAddress.id && !selectedAddressId) {
      setSelectedAddressId(shippingAddress.id);
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create internal pending order on backend
      const orderRes: any = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.product_id || i.id, quantity: i.quantity })),
        coupon_code: couponCode?.trim() || null,
        shipping_address: shippingAddress,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to create order');
      }

      const internalOrder = orderRes.order;
      const orderId = internalOrder.orderId || internalOrder.id;

      // Handle Cash on Delivery / Store Pickup
      if (paymentMethod === 'cod') {
        const codRes: any = await api.post('/payment/confirm-cod', {
          order_id: orderId,
        });

        if (codRes && codRes.success) {
          clearCart();
          showSuccess('Order Placed Successfully! (Payment to be collected upon parcel delivery)');
          navigate(`/orders/${orderId}`, { state: { orderConfirmed: true } });
        } else {
          throw new Error(codRes?.message || 'Failed to confirm COD order');
        }
        return;
      }

      // Step 2: Create Real Razorpay Order on backend
      const paymentRes: any = await api.post('/payment/create-order', {
        order_id: orderId,
      });

      if (!paymentRes || !paymentRes.success || !paymentRes.razorpayOrderId) {
        throw new Error(paymentRes?.message || 'Payment initialization failed. Please try again.');
      }

      // Step 3: Launch Official Razorpay Checkout Modal
      const rzpLoaded = await loadRazorpayScript();
      if (!rzpLoaded && !window.Razorpay) {
        throw new Error('Unable to initialize Razorpay payment gateway. Please check your network connection.');
      }

      // Launch Gateway Modal
      openRazorpayModal(internalOrder, paymentRes, shippingAddress);
    } catch (err: any) {
      setProcessingPayment(false);
      showError(err.message || 'Payment flow encountered an error');
    }
  };

  const verifyAndCompleteOrder = async (orderId: string, rzpOrderId: string, paymentId: string, signature: string) => {
    try {
      setProcessingPayment(true);
      const verifyRes: any = await api.post('/payment/verify', {
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      if (verifyRes.success) {
        clearCart();
        showSuccess('Payment Verified & Order Confirmed! Invoice sent to your email.');
        navigate(`/orders/${orderId}`, { state: { orderConfirmed: true } });
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      showError(err.message || 'Payment verification failed: Signature mismatch or bank decline');
    } finally {
      setProcessingPayment(false);
    }
  };

  const shippingCharge = 0;
  const grandTotal = subtotal;

  if (items.length === 0) {
    return null;
  }

  const isStep1Done = Boolean(user);
  const activeShippingAddr = getActiveShippingAddress();
  const isStep2Done = Boolean(isStep1Done && activeShippingAddr && !showNewAddressForm);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Express Checkout</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
              Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Direct dispatch from New Alagar Auto Parts, West Main St, Pudukkottai
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted & Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: 3-Step Container (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* ================= STEP 1: CUSTOMER IDENTIFICATION ================= */}
          <div
            id="checkout-step-1"
            className={`rounded-3xl bg-white border transition-all shadow-sm ${
              isStep1Done ? 'border-slate-200' : 'border-red-300 ring-2 ring-red-500/10'
            }`}
          >
            {isStep1Done ? (
              // Step 1 Completed State
              <div className="p-5 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Step 1 • Customer Account Verified
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {user?.name || 'Customer'}{' '}
                      <span className="text-slate-500 font-normal text-xs">({user?.email})</span>
                    </p>
                    {user?.phone && (
                      <p className="text-[11px] text-slate-400 font-medium">📞 +91 {user.phone}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showInfo('Signed out. Please sign in or register to complete your order.');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Switch account
                </button>
              </div>
            ) : (
              // Step 1 Active / Not Signed In State
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                        Step 1
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Customer Identification
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sign in or create a quick account to receive instant order tracking & invoice emails.
                    </p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Returning Customer (Sign In)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New Customer (Quick Register)</span>
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* SIGN IN FORM */}
                {authMode === 'signin' ? (
                  <form onSubmit={handleInlineLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="e.g. aadithya@gmail.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAuth}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
                    >
                      {submittingAuth ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In & Continue to Address</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  // QUICK REGISTER FORM
                  <form onSubmit={handleInlineRegister} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Aadithya R"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9876543210"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="aadithya@example.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Create Password (min 6 characters) *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAuth}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
                    >
                      {submittingAuth ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account & Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* ================= STEP 2: DELIVERY ADDRESS ================= */}
          <div
            id="checkout-step-2"
            className={`rounded-3xl bg-white border transition-all shadow-sm ${
              !isStep1Done
                ? 'opacity-60 pointer-events-none border-slate-200'
                : isStep2Done
                ? 'border-slate-200'
                : 'border-red-300 ring-2 ring-red-500/10'
            }`}
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isStep2Done ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {isStep2Done ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
                      2. Delivery Address
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {isStep2Done
                        ? 'Delivery address confirmed & saved to your profile'
                        : 'Choose where you want your automotive parts delivered'}
                    </p>
                  </div>
                </div>

                {isStep1Done && addresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Existing Saved Addresses Grid */}
              {isStep1Done && !showNewAddressForm && addresses.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                    {addresses.map((addr) => {
                      const isSelected =
                        String(selectedAddressId) === String(addr.id) ||
                        (!selectedAddressId && activeShippingAddr && String(activeShippingAddr.id) === String(addr.id));
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-red-50/70 border-red-500 text-slate-900 shadow-xs ring-1 ring-red-500/30'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {addr.full_name}
                              {addr.is_default && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-200 text-slate-700 uppercase">
                                  Default
                                </span>
                              )}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {addr.address_line_1}
                            {addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                            <br />
                            {addr.area ? `${addr.area}, ` : ''}
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-2.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {addr.phone}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeShippingAddr && (
                    <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Delivering to: <strong>{activeShippingAddr.full_name}</strong> ({activeShippingAddr.city})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeShippingAddr.id) {
                            setSelectedAddressId(activeShippingAddr.id);
                          }
                          const el = document.getElementById('checkout-step-3');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          showSuccess(`Delivering to ${activeShippingAddr.full_name}`);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                      >
                        <span>Deliver to this Address & Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {isStep1Done && (showNewAddressForm || addresses.length === 0) && (
                <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Recipient full name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                        }
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Flat / House No. / Building / Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address_line_1}
                      onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                      placeholder="e.g. 14/B, West Main Street, Near New Bus Stand"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Area / Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="e.g. Opposite Alagar Kovil Arch"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 622001"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      {savingAddress ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Saving Address...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Address & Proceed</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ================= STEP 3: SELECT PAYMENT METHOD ================= */}
          <div
            id="checkout-step-3"
            className={`rounded-3xl bg-white border transition-all shadow-sm ${
              !isStep2Done ? 'opacity-60 pointer-events-none border-slate-200' : 'border-slate-200'
            }`}
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
                      3. Select Payment Method
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Choose your preferred payment gateway or store counter pickup
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Razorpay Verified
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Option A: Google Pay / PhonePe / UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start sm:items-center justify-between gap-3 ${
                    paymentMethod === 'upi'
                      ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-500/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'upi' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          Google Pay (GPay) / PhonePe / UPI & QR
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          Instant & Zero Surcharge
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay instantly with your mobile UPI app, GPay, PhonePe, or scan dynamic QR code
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-800 shadow-2xs">
                          Google Pay
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-purple-700 shadow-2xs">
                          PhonePe
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-sky-600 shadow-2xs">
                          Paytm
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-amber-600 shadow-2xs">
                          Scan QR
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0 hidden sm:block">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                {/* Option B: Credit / Debit Cards & Netbanking */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start sm:items-center justify-between gap-3 ${
                    paymentMethod === 'card'
                      ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-500/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'card' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Credit / Debit Card, Netbanking & EMI
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Visa, Mastercard, RuPay & 50+ Indian netbanking options
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-blue-800 shadow-2xs">
                          Visa
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-orange-600 shadow-2xs">
                          Mastercard
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-emerald-700 shadow-2xs">
                          RuPay
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0 hidden sm:block">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>

                {/* Option C: Cash on Delivery / Store Pickup */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start sm:items-center justify-between gap-3 ${
                    paymentMethod === 'cod'
                      ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-500/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cod' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Cash on Delivery (COD) / Store Pickup Counter
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
                          Pudukkottai Store
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay cash upon parcel delivery or inspect parts and collect directly at our West Main St store
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0 hidden sm:block">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Step 3 Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={processingPayment}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
                >
                  {processingPayment ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Order with COD (₹{Number(grandTotal).toLocaleString('en-IN')})</span>
                    </>
                  ) : paymentMethod === 'upi' ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Confirm Order & Pay ₹{Number(grandTotal).toLocaleString('en-IN')} with UPI →</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{Number(grandTotal).toLocaleString('en-IN')} with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Order Review
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {items.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Free Shipping Alert */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">✨ 100% FREE Store Express Delivery Applied!</span>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.product_id || item.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate flex-1">
                    <p className="text-slate-900 font-semibold truncate">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">
                      Qty: {item.quantity} × ₹{Number(item.selling_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{Number(item.selling_price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling</span>
                {shippingCharge === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingCharge}</span>
                )}
              </div>


              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{Number(grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Main Action Button */}
            {!isStep1Done ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('checkout-step-1');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  showInfo('Please sign in or enter your email in Step 1 to continue');
                }}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span>Complete Step 1 to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !isStep2Done ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('checkout-step-2');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  showInfo('Please save or select your delivery address to proceed to payment');
                }}
                className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <MapPin className="w-4 h-4" />
                <span>Save or Select Address to Pay</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={processingPayment}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {processingPayment ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Order with COD (₹{Number(grandTotal).toLocaleString('en-IN')})</span>
                  </>
                ) : paymentMethod === 'upi' ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Pay ₹{Number(grandTotal).toLocaleString('en-IN')} with UPI & QR</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{Number(grandTotal).toLocaleString('en-IN')} with Razorpay</span>
                  </>
                )}
              </button>
            )}

            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Genuine Auto Parts with OEM Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Fast Dispatch from Pudukkottai Central Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
