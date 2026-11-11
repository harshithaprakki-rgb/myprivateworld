import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const { login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter your email.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (!acceptTerms) throw new Error('You must accept the terms of service.');

        await register(name, email, password, acceptTerms);
        onClose();
      } else if (mode === 'login') {
        if (!email.trim() || !password) throw new Error('Please fill in both email and password.');
        await login(email, password);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your email address.');
        const res = await api.forgotPassword(email);
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-7 text-[#49372E] parchment-texture">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-2.5 rounded-full bg-[#EADCC8]/60 text-[#49372E]">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif-vintage font-semibold text-[#49372E]">
            {mode === 'login' && 'Enter Your Private Sanctuary'}
            {mode === 'register' && 'Begin Your Personal World'}
            {mode === 'forgot' && 'Account Recovery'}
          </h2>
          <p className="text-xs text-[#8B6F5E]">
            {mode === 'login' && 'Sign in to access your secluded digital journal.'}
            {mode === 'register' && 'Every account has complete, isolated privacy.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E] placeholder-[#8B6F5E]/50"
                />
                <UserIcon className="w-4 h-4 text-[#8B6F5E]/60 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#49372E] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E] placeholder-[#8B6F5E]/50"
              />
              <Mail className="w-4 h-4 text-[#8B6F5E]/60 absolute right-3 top-3" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#49372E]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#8B6F5E] hover:text-[#49372E] underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E] placeholder-[#8B6F5E]/50"
                />
                <Lock className="w-4 h-4 text-[#8B6F5E]/60 absolute right-3 top-3" />
              </div>

              {/* Password strength indicator for registration */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8B6F5E]">
                    <span>Password Strength:</span>
                    <span className="font-medium">
                      {passwordScore <= 1 && 'Weak'}
                      {passwordScore === 2 && 'Fair'}
                      {passwordScore === 3 && 'Good'}
                      {passwordScore >= 4 && 'Strong'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#EADCC8] rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className={`h-full flex-1 ${
                        passwordScore >= 1 ? 'bg-amber-600' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 ${
                        passwordScore >= 2 ? 'bg-amber-600' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 ${
                        passwordScore >= 3 ? 'bg-emerald-600' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 ${
                        passwordScore >= 4 ? 'bg-emerald-700' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="pt-1 flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-[#8B6F5E] text-[#49372E] focus:ring-[#8B6F5E]"
              />
              <label htmlFor="terms" className="text-xs text-[#8B6F5E] leading-snug">
                I agree to the Terms of Service and Privacy Policy. I understand my diary is completely private to my account.
              </label>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#8B6F5E] text-[#49372E] focus:ring-[#8B6F5E]"
              />
              <label htmlFor="remember" className="text-xs text-[#8B6F5E]">
                Remember this device securely
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to Diary'
              : mode === 'register'
              ? 'Create My Private World'
              : 'Send Reset Instructions'}
          </button>
        </form>

        {/* Modal Footer Mode Switch */}
        <div className="mt-6 pt-4 border-t border-[#EADCC8] text-center text-xs text-[#8B6F5E]">
          {mode === 'login' && (
            <p>
              New to My Private World?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="font-semibold text-[#49372E] hover:underline ml-1"
              >
                Create an Account
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already have a diary?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="font-semibold text-[#49372E] hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="font-semibold text-[#49372E] hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
