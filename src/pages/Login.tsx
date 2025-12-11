import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from
    ? `${(location.state as any).from.pathname}${(location.state as any).from.search}`
    : '/dashboard';

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl flex gap-8 items-center">
        <div className="hidden lg:flex flex-1 flex-col justify-center">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Welcome to <span className="text-emerald-600">Clarsix</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
            Secure escrow protection for freelancers, businesses, and online transactions
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Universal Protection</h3>
                <p className="text-neutral-600">Secure escrow for all transaction types</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Trusted Escrow</h3>
                <p className="text-neutral-600">Neutral third-party protection for both parties</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">24-Hour Buyer Protection</h3>
                <p className="text-neutral-600">Inspect goods or work before payment is released to seller</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[480px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                <svg width="72" height="72" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-18 h-18">
                  <g transform="translate(100, 100)">
                    <path d="M 0,-50 L 43.3,-25 L 43.3,25 L 0,50 L -43.3,25 L -43.3,-25 Z"
                      fill="black"
                      stroke="black"
                      strokeWidth="4" />
                    <circle cx="0" cy="0" r="32" fill="black" stroke="white" strokeWidth="4" />
                    <rect x="0" y="-38" width="38" height="76" fill="black" />
                    <text x="15" y="-15" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                    <text x="26" y="0" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                    <text x="15" y="15" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                    <text x="-15" y="15" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                    <text x="-26" y="0" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                    <text x="-15" y="-15" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="white">*</text>
                  </g>
                </svg>
                <span className="text-2xl font-bold text-neutral-900">Clarsix</span>
              </Link>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h2>
              <p className="text-neutral-600">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                leftIcon={<Mail className="h-5 w-5" />}
                placeholder="user@company.com"
              />

              <div>
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock className="h-5 w-5" />}
                  placeholder="Enter your password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
                <div className="mt-2 text-right">
                  <Link to="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-neutral-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
