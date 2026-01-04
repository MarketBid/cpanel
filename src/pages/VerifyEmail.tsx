import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const VerifyEmail: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isMaxAttempts, setIsMaxAttempts] = useState(false);

    const { verifyUser, resendOtp, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('pending_verification_email');
        if (!storedEmail) {
            navigate('/register');
            return;
        }
        setEmail(storedEmail);
    }, [navigate]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !canResend) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [countdown, canResend]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await verifyUser(email, otp);
            localStorage.removeItem('pending_verification_email');
            setSuccessMessage('Email verified successfully! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            const message = err.response?.data?.detail || err.message || 'Verification failed';

            // Handle specific error cases based on the prompt
            if (message.includes('Maximum OTP attempts reached')) {
                setIsMaxAttempts(true);
                setError(message);
            } else if (message.includes('OTP has expired')) {
                // Extract attempts remaining if present (though expired usually means request new)
                setError(message);
            } else if (message.includes('Invalid OTP code')) {
                // Extract attempts remaining if present
                setError(message);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await resendOtp(email);
            setSuccessMessage('A new OTP has been sent to your email.');
            setCountdown(60);
            setCanResend(false);
            setIsMaxAttempts(false); // Reset max attempts state if they can resend? 
            // Actually prompt says "Maximum OTP attempt reached", Ask the user to try to verify in the next 30 minutes
            // So maybe resend shouldn't be allowed if max attempts reached? 
            // But if they wait 30 mins, they might need to resend.
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setIsMaxAttempts(false);
        setError('');
        setOtp('');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-4 left-4">
                <Link
                    to={isAuthenticated ? "/dashboard" : "/login"}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium text-sm"
                >
                    <div className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline">{isAuthenticated ? "Back to Dashboard" : "Back to Login"}</span>
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
                            <div className="flex justify-center mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-light)]">
                                    <ShieldCheck className="h-8 w-8 text-[var(--color-primary)]" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Verify Email</h2>
                            <p className="text-[var(--text-secondary)]">
                                Please enter the 6-digit code sent to your email address.
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

                        {isMaxAttempts ? (
                            <div className="text-center">
                                <p className="text-[var(--text-secondary)] mb-6">
                                    Please wait before trying again.
                                </p>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Back to Verification
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <Input
                                    label="One-Time Password"
                                    name="otp"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => {
                                        // Only allow numbers and max 6 chars
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
                                    }}
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={loading}
                                    className="w-full"
                                    disabled={otp.length !== 6}
                                >
                                    Verify
                                </Button>

                                <div className="text-center pt-2">
                                    {canResend ? (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2 w-full"
                                            disabled={loading}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                            Resend OTP
                                        </button>
                                    ) : (
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Resend code in {countdown}s
                                        </p>
                                    )}
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VerifyEmail;
