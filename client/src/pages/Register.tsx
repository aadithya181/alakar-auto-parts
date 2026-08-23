import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, User, Phone, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p))   score++;
  if (/[0-9]/.test(p))   score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f97316' };
  if (score <= 3) return { score, label: 'Good',   color: '#eab308' };
  if (score <= 4) return { score, label: 'Strong', color: '#22c55e' };
  return               { score, label: 'Very Strong', color: '#16a34a' };
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const strength = getPasswordStrength(formData.password);
  const strengthPct = formData.password ? (strength.score / 5) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await register(formData.name, formData.email, formData.password, formData.phone);
      setSubmitted(true);
      showSuccess(`Account created! Welcome to Alakar Auto Parts, ${user.name} 🎉`);
      setTimeout(() => navigate('/'), 800);
    } catch (err: any) {
      showError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{ key: keyof typeof formData; label: string; type: string; placeholder: string; icon: React.ReactNode; required: boolean; delay: string }> = [
    { key: 'name',  label: 'Full Name',     type: 'text',     placeholder: 'Aadithya R',         icon: <User    className="w-4 h-4" />, required: true,  delay: 'animate-field-1' },
    { key: 'email', label: 'Email Address', type: 'email',    placeholder: 'name@example.com',   icon: <Mail    className="w-4 h-4" />, required: true,  delay: 'animate-field-2' },
    { key: 'phone', label: 'Mobile Phone',  type: 'tel',      placeholder: '+91 98765 43210',    icon: <Phone   className="w-4 h-4" />, required: false, delay: 'animate-field-3' },
  ];

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb1 absolute -top-24 -right-24 w-80 h-80 rounded-full bg-red-100/60 blur-3xl" />
        <div className="orb2 absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-rose-50/40 blur-2xl orb1" />
      </div>

      <div
        className="w-full max-w-md relative z-10"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        {/* Card */}
        <div className="animate-auth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 space-y-6">

          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className={`animate-logo-pop w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${submitted ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/40 scale-110' : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/40'}`}>
              {submitted
                ? <CheckCircle2 className="w-8 h-8 text-white animate-success drop-shadow" />
                : <Car className="w-8 h-8 text-white drop-shadow" />
              }
            </div>
            <div className="animate-heading">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {submitted ? 'Account Created! 🎉' : 'Create Your Account'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Join <span className="text-red-600 font-bold">Alakar Auto Parts</span> · Pudukkottai
              </p>
            </div>
          </div>

          {/* Features strip */}
          <div className="animate-badge grid grid-cols-3 gap-2 text-center">
            {[
              { icon: '🚗', label: 'Save Vehicles' },
              { icon: '⚡', label: 'Fast Checkout' },
              { icon: '📦', label: 'Track Orders' },
            ].map((f) => (
              <div key={f.label} className="py-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg">{f.icon}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name, Email, Phone fields */}
            {fields.map((f) => (
              <div key={f.key} className={f.delay}>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <div className={`relative transition-transform duration-200 ${focusedField === f.key ? 'scale-[1.01]' : ''}`}>
                  <input
                    type={f.type}
                    required={f.required}
                    value={formData[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={f.placeholder}
                    className="auth-input w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400"
                  />
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === f.key ? 'text-red-500' : 'text-slate-400'}`}>
                    {f.icon}
                  </span>
                </div>
              </div>
            ))}

            {/* Password with strength meter */}
            <div className="animate-field-4">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-transform duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min 6 characters"
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

              {/* Strength meter */}
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="strength-bar h-full rounded-full transition-all duration-300"
                      style={{ width: `${strengthPct}%`, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: strength.color }}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <Shield className="w-3 h-3 text-slate-400 flex-shrink-0" />
              Your data is securely stored in Supabase cloud database
            </div>

            {/* Submit Button */}
            <div className="animate-btn-long pt-1">
              <button
                type="submit"
                disabled={loading || submitted}
                className="btn-primary-auth w-full py-3.5 rounded-2xl bg-red-600 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitted ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Done! Redirecting…
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spin-ring" />
                    Creating Account…
                  </span>
                ) : (
                  'Create Account →'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-slate-500 animate-btn-long">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Bottom badges */}
        <div className="flex items-center justify-center gap-5 mt-5 animate-btn-long">
          {['✅ Direct Supabase', '🔒 Encrypted Passwords', '🇮🇳 Made in India'].map((b) => (
            <span key={b} className="text-[10px] text-slate-400 font-medium">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
