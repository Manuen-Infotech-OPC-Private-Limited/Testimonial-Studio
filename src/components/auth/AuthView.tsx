import React, { useState, useEffect } from 'react';
import {
  Quote,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { checkBackendHealth, BackendHealth } from '../../utils/storageApi';

interface AuthViewProps {
  onAuthSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const { signIn, signUp, authError, clearAuthError } = useStudioStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  const loadHealth = async () => {
    const res = await checkBackendHealth();
    setHealth(res);
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setLocalError(null);
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    const digits = mobileNumber.replace(/\D/g, '');
    if (mode === 'signup' && name.trim().length < 2) {
      setLocalError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (digits.length < 10 || digits.length > 15) {
      setLocalError('Please enter a valid 10 to 15 digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const ok =
      mode === 'signin'
        ? await signIn(mobileNumber, password)
        : await signUp(name.trim(), mobileNumber, password);
    setIsSubmitting(false);

    if (ok) {
      onAuthSuccess?.();
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[100dvh] w-full overflow-y-auto bg-gradient-to-br from-[#081226] via-[#0B1B3B] to-[#112954] flex items-center justify-center px-4 py-6 sm:p-6 select-none">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E5B54F] text-slate-950 shadow-lg shadow-amber-500/20">
            <Quote className="w-6 h-6 fill-slate-950 -scale-x-100" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Testimonial Studio
            </h1>
            <p className="text-xs font-medium text-amber-300/90 tracking-[0.14em] uppercase mt-0.5">
              Sign in to access your designs in any browser
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 space-y-5 sm:space-y-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-[#0F2D6B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-[#0F2D6B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* MongoDB Status Pill */}
          {health && !health.dbConnected && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
              <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">Database connection unavailable</p>
                <p className="text-[11px] opacity-90">
                  Ensure the Node.js server (`npm run dev`) is running and database access is active.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadHealth()}
                className="text-[11px] font-bold text-amber-800 underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {displayError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="block text-xs font-bold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-name"
                    name="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2D6B] text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-mobile" className="block text-xs font-bold text-slate-700">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-mobile"
                  name="mobileNumber"
                  type="tel"
                  inputMode="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+\-\s()]/g, ''))}
                  placeholder="e.g. 9876543210 or +91 98765 43210"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2D6B] text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create password (min 6 chars)' : 'Enter your password'}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2D6B] text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0F2D6B] hover:bg-[#0B214E] text-white font-bold text-sm shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {health?.dbConnected && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connected to MongoDB</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;

