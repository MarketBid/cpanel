import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService } from '../utils/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await authService.resetPassword(formData.email, formData.password);
            setSuccessMessage('Password reset successfully');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            const message = err.message || 'Failed to reset password';
            setError(message);
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
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-4 left-4">
                <Link
                    to="/login"
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium text-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline">Back to Login</span>
                </Link>
            </div>
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                <Card className="border-2 border-[var(--color-primary-light)]">
                    <CardContent className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                                <Logo size={60} />
                                <span className="text-2xl font-bold text-[var(--text-primary)]">Clarsix</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Reset Password</h2>
                            <p className="text-[var(--text-secondary)]">
                                Enter your email and new password.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] text-[var(--alert-error-text)] px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>{error}</div>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-slide-down flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>{successMessage}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="user@company.com"
                            />

                            <Input
                                label="New Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                leftIcon={<Lock className="h-5 w-5" />}
                                placeholder="New password"
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

                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                leftIcon={<Lock className="h-5 w-5" />}
                                placeholder="Confirm new password"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={loading}
                                className="w-full"
                            >
                                Reset Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
