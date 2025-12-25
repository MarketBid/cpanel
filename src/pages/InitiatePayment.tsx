import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  CreditCard,
  Shield,
  AlertCircle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { generateContractPDF } from '../utils/pdfGenerator';
import { Transaction, TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import { useTransaction } from '../hooks/queries/useTransactions';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Card, CardContent, Input } from '../components/ui';

const InitiatePayment: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const queryClient = useQueryClient();

  // Use React Query to fetch transaction with caching
  const { data: transaction, isLoading, error: transactionError, refetch } = useTransaction(transactionId);

  const processPayment = async () => {
    if (!transaction) return;

    // Validate guest contact if user is not logged in
    if (!user && !guestContact) {
      setError('Please enter your email or contact number to proceed.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const payload: any = {};

      if (!user && guestContact) {
        // Determine if input is email or contact
        const isEmail = guestContact.includes('@');
        if (isEmail) {
          payload.email = guestContact;
        } else {
          payload.contact = guestContact;
        }
      }

      const response = await apiClient.post(`/payment/initiate-payment/${transaction.transaction_id}`, payload);

      if (response.status === 'success' && response.data.message === 'Payment already completed') {
        setError('Payment has already been completed for this transaction.');
        setTimeout(() => {
          refetch();
          navigate(`/transactions/${transaction.transaction_id}`);
        }, 1500);
        return;
      }

      // Update cache with new transaction details
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });

      window.location.href = response.data;
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-[var(--bg-tertiary)] rounded-3xl flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Transaction Not Found</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              The transaction you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="primary" onClick={() => navigate('/transactions')}>
              View Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canPay = transaction.status === TransactionStatus.PENDING;
  const isPaid = [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status);
  const isReceiver = transaction.receiver_id === user?.id;
  const isSender = transaction.sender_id === user?.id;



  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {!user ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/login?redirect=/payment/initiate-payment/${transactionId}`)}
              >
                Login
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            )}
          </div>
          <button
            onClick={() => generateContractPDF(transaction)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-default)]"
          >
            <FileText className="h-4 w-4" />
            View Contract
          </button>
        </div>        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] dark:from-[var(--color-primary)] dark:to-[var(--color-primary-dark)] rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">Complete Payment</h1>
                <p className="text-sm sm:text-base text-white/80">Secure escrow-protected transaction</p>
              </div>
            </div>
          </div>

          {/* Payment Amount Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <div className="text-xs sm:text-sm text-white/70 mb-1">Transaction #{transaction.transaction_id}</div>
                <div className="text-base sm:text-lg text-white/90">{transaction.title}</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm text-white/70 mb-1">Total Amount</div>
                <div className="text-3xl sm:text-4xl font-bold">₵{maskAmount(transaction.amount)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isPaid && (
          <div className="bg-[var(--alert-success-bg)] border border-[var(--alert-success-border)] rounded-xl p-6 animate-slide-down">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--alert-success-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-[var(--alert-success-text)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--alert-success-text)] mb-1">Payment Completed</h3>
                <p className="text-sm text-[var(--alert-success-text)]">
                  This transaction has already been paid. Funds are securely held in escrow until delivery confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-6 animate-slide-down">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--alert-error-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-[var(--alert-error-text)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--alert-error-text)] mb-1">Payment Error</h3>
                <p className="text-sm text-[var(--alert-error-text)]">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment Breakdown */}
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-default)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--text-primary)]" />
              Payment Summary
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="text-sm sm:text-base text-[var(--text-secondary)]">Transaction Amount</span>
                <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">₵{maskAmount(transaction.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 sm:py-3 border-t border-[var(--border-default)]">
                <span className="text-sm sm:text-base text-[var(--text-secondary)]">Platform Fee</span>
                <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">₵0.00</span>
              </div>
              <div className="flex justify-between items-center py-3 sm:py-4 border-t-2 border-[var(--border-medium)]">
                <span className="text-base sm:text-xl font-semibold text-[var(--text-primary)]">Total to Pay</span>
                <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  ₵{maskAmount(transaction.amount)}
                </span>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[var(--border-default)] space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">Paying to:</span>
                <span className="font-medium text-[var(--text-primary)]">{transaction.receiver?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">Created:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Action */}
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-default)] p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 sm:mb-6">Payment Method</h2>

            {canPay && !isReceiver && (
              <>
                <div className="p-3 sm:p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-[var(--text-primary)]" />
                    <h4 className="font-semibold text-[var(--text-primary)]">Escrow Protection</h4>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Your payment will be held securely in escrow until you confirm delivery of the item.
                  </p>
                </div>

                {!user && (
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="guest-contact" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      Email or Contact Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="guest-contact"
                      placeholder="Enter your email or phone number"
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                      We'll use this to create an account for you to track this transaction.
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mb-4 sm:mb-6 text-sm sm:text-base"
                  leftIcon={<CreditCard className="h-5 w-5" />}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={processPayment}
                  loading={processing}
                >
                  Proceed to Payment
                </Button>


              </>
            )}

            {canPay && isReceiver && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-[var(--bg-tertiary)] rounded-2xl flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  {isSender
                    ? "Waiting for sender to complete payment"
                    : "This transaction can only be paid by the assigned sender"
                  }
                </p>
              </div>
            )}

            {isPaid && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-[var(--bg-tertiary)] rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-[var(--text-primary)]" />
                </div>
                <p className="font-medium text-[var(--text-primary)] mb-1">Payment Complete</p>
                <p className="text-sm text-[var(--text-secondary)]">Funds are secured in escrow</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiatePayment;
