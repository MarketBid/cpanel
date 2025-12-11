import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Building, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BUSINESS_CATEGORIES } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    is_business: false,
    business_category: '',
    social_media_links: {
      instagram: '',
      facebook: '',
      twitter: '',
      whatsapp: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const registerData = {
        ...formData,
        social_media_links: formData.is_business ? formData.social_media_links : undefined
      };

      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('social_')) {
      const socialField = name.replace('social_', '');
      setFormData({
        ...formData,
        social_media_links: {
          ...formData.social_media_links,
          [socialField]: value
        }
      });
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl flex gap-8 items-center">
        <div className="hidden lg:flex flex-1 flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium mb-6 w-fit">
            <Sparkles className="h-4 w-4" />
            Join 10,000+ businesses
          </div>

          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Start Your Journey with{' '}
            <span className="text-emerald-600">
              Clarsix
            </span>
          </h1>
          <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
            Join thousands protecting their transactions with secure escrow services
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">24-Hour Buyer Protection</h3>
                <p className="text-neutral-600">Inspect goods or work for 24 hours. Raise disputes if needed, or funds release automatically</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Business or Personal</h3>
                <p className="text-neutral-600">Perfect for freelancers, sellers, and businesses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[520px] flex-shrink-0">
          <Card className="border-2 border-emerald-100">
            <CardContent className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                  <svg width="72" height="72" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-18 h-18">
                    <g transform="translate(100, 100)">
                      <path d="M 0,-50 L 43.3,-25 L 43.3,25 L 0,50 L -43.3,25 L -43.3,-25 Z"
                            fill="black"
                            stroke="black"
                            strokeWidth="4"/>
                      <circle cx="0" cy="0" r="32" fill="black" stroke="white" strokeWidth="4"/>
                      <rect x="0" y="-38" width="38" height="76" fill="black"/>
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
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Create Account</h2>
                <p className="text-neutral-600">Join our secure payment platform</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  leftIcon={<User className="h-5 w-5" />}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Mail className="h-5 w-5" />}
                  placeholder="user@company.com"
                />

                <Input
                  label="Contact Number"
                  name="contact"
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={handleInputChange}
                  leftIcon={<Phone className="h-5 w-5" />}
                  placeholder="+233 XX XXX XXXX"
                />

                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock className="h-5 w-5" />}
                  placeholder="Create a strong password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  helperText="Minimum 8 characters"
                />

                <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <input
                    id="is_business"
                    name="is_business"
                    type="checkbox"
                    checked={formData.is_business}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="is_business" className="ml-3 flex items-center gap-2 cursor-pointer">
                    <Building className="h-5 w-5 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-900">Register as Business Account</span>
                  </label>
                </div>

                {formData.is_business && (
                  <div className="space-y-5 p-6 bg-emerald-50 rounded-xl border border-emerald-200 animate-slide-down">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Business Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="business_category"
                        value={formData.business_category}
                        onChange={handleInputChange}
                        required={formData.is_business}
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        {BUSINESS_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-neutral-700">Media Links (Optional)</h3>
                      <Input
                        name="social_instagram"
                        type="url"
                        value={formData.social_media_links.instagram}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                      />
                      <Input
                        name="social_facebook"
                        type="url"
                        value={formData.social_media_links.facebook}
                        onChange={handleInputChange}
                        placeholder="Facebook URL"
                      />
                      <Input
                        name="social_whatsapp"
                        type="tel"
                        value={formData.social_media_links.whatsapp}
                        onChange={handleInputChange}
                        placeholder="WhatsApp Number"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Create Account
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-neutral-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
