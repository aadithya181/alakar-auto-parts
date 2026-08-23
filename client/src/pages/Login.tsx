import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Lock, Mail, Eye, EyeOff, Zap, User2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.name}! 🎉`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate((location.state as any)?.from || '/');
      }
    } catch (err: any) {
      showError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, label: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPass);
      showSuccess(`Logged in as ${user.name} (${user.role}) ✅`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb1 absolute -top-20 -left-20 w-72 h-72 rounded-full bg-red-100/60 blur-3xl" />
        <div className="orb2 absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-rose-50/40 blur-2xl" />
      </div>

      <div
        className="w-full max-w-md relative z-10"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        {/* Card */}
        <div className="animate-auth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 space-y-6">

          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="animate-logo-pop w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto shadow-lg shadow-red-500/40">
              <Car className="w-8 h-8 text-white drop-shadow" />
            </div>
            <div className="animate-heading">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign In
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back to <span className="text-red-600 font-bold">Alakar Auto Parts</span>
              </p>
            </div>
          </div>

          {/* Quick Demo Shortcuts */}
          <div className="animate-badge">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 text-center">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer@alakarautoparts.com', 'customer123', 'Customer')}
                disabled={loading}
                className="demo-btn group py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="w-6 h-6 rounded-lg bg-slate-200 group-hover:bg-slate-300 flex items-center justify-center transition-colors">
                  <User2 className="w-3.5 h-3.5 text-slate-600" />
                </span>
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@alakarautoparts.com', 'admin123', 'Admin')}
                disabled={loading}
                className="demo-btn group py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-xs font-bold text-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="w-6 h-6 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                  <Zap className="w-3.5 h-3.5 text-red-600" />
                </span>
                Surendar (Admin)
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="animate-field-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className={`relative transition-transform duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  className="auth-input w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400"
                />
                <Mail className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-red-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Password */}
            <div className="animate-field-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className={`relative transition-transform duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="auth-input w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400"
                />
                <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-red-500' : 'text-slate-400'}`} />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-btn pt-1">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-auth w-full py-3.5 rounded-2xl bg-red-600 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spin-ring" />
                    Signing In…
                  </span>
                ) : (
                  'Sign In →'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-slate-500 animate-btn">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Bottom trust badges */}
        <div className="flex items-center justify-center gap-4 mt-5 animate-btn">
          {['🔒 Secure Login', '⚡ Instant Access', '🚗 Save Your Garage'].map((b) => (
            <span key={b} className="text-[10px] text-slate-400 font-medium">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
