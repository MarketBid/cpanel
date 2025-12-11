import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, User, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import { useJoinTransaction, useTransactionByPaymentCode } from '../hooks/queries/useTransactions';

const PaymentCode: React.FC = () => {
  const { paymentCode } = useParams<{ paymentCode: string }>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const joinTransactionMutation = useJoinTransaction();

  // Use React Query to fetch transaction by payment code with caching
  const { data: transaction, isLoading: loading } = useTransactionByPaymentCode(paymentCode, !!paymentCode);

  const processPayment = async () => {
    if (!transaction) return;

    setProcessing(true);
    try {
      // This would integrate with your payment provider (Paystack, etc.)
      const response = await apiClient.post<{ payment_url?: string }>(`/payment/initiate-payment`, {
        transaction_id: transaction.id,
        amount: transaction.amount,
        callback_url: window.location.origin + `/transactions/${transaction.id}`
      });

      // Redirect to payment provider or show payment form
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const assignSelfAsReceiver = async () => {
    if (!transaction || !user || !paymentCode) return;

    try {
      await joinTransactionMutation.mutateAsync({
        transactionId: transaction.transaction_id,
        paymentCode: paymentCode
      });
    } catch (error) {
      setError('Failed to assign receiver. Please try again.');
    }
  };

  const formatAmount = (amount: number) => {
    return `₵${maskAmount(amount)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 mb-6">
            The payment code "{paymentCode}" doesn't match any active transactions.
          </p>
          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Transactions
          </button>
        </div>
      </div>
    );
  }

  const canPay = transaction.status === TransactionStatus.PENDING;
  const isPaid = [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status);
  const isSender = transaction.sender_id === user?.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[rgba(0,217,255,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
            {isPaid ? (
              <CheckCircle className="h-8 w-8 text-[#10B981]" />
            ) : (
              <Package className="h-8 w-8 text-[#1A1A1A]" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            {isPaid ? 'Payment Completed' : 'Secure Payment'}
          </h1>
          <p className="text-[#6B7280]">
            Payment Code: <span className="font-medium">{paymentCode}</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[#FECACA] text-[#B91C1C] px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Transaction Details */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {transaction.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {transaction.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm text-gray-500">Transaction ID</span>
              <p className="font-medium text-gray-900">{transaction.transaction_id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Amount</span>
              <p className="font-medium text-gray-900">{formatAmount(transaction.amount)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <p className="font-medium text-gray-900 capitalize">{transaction.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Created</span>
              <p className="font-medium text-gray-900">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Receiver Information</h2>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">{transaction.sender?.name}</h4>
          <p className="text-sm text-gray-600">{transaction.sender?.email}</p>
          <p className="text-sm text-gray-600">{transaction.sender?.contact}</p>
          {transaction.sender?.rating && (
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(transaction.sender!.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  >
                    ★
                  </div>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {transaction.sender.rating.toFixed(1)} ({transaction.sender.total_ratings} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Action */}
      {!isPaid && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
          </div>

          {!transaction.receiver_id && !isSender && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                This transaction doesn't have an assigned receiver yet. Would you like to proceed as the receiver?
              </p>
              <button
                onClick={assignSelfAsReceiver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Accept as Receiver
              </button>
            </div>
          )}

          {canPay && (transaction.receiver_id || !isSender) && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatAmount(transaction.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatAmount(transaction.amount)}</span>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={processing || isSender}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : isSender ? (
                  'Cannot pay your own transaction'
                ) : (
                  `Pay ${formatAmount(transaction.amount)}`
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Your payment is secured by escrow. The receiver will only receive funds after you confirm delivery.
              </p>
            </div>
          )}

          {isSender && (
            <div className="text-center py-4">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Waiting for payment from sender</p>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {isPaid && (
        <div className="bg-[rgba(16,185,129,0.12)] border border-[#BBF7D0] rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-[#10B981] mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[#0F9B73] mb-2">Payment Successful!</h3>
          <p className="text-[#065F46] mb-4">
            The payment has been processed and is being held in escrow until delivery is confirmed.
          </p>
          <button
            onClick={() => navigate(`/transactions/${transaction.id}`)}
            className="inline-flex items-center px-4 py-2 bg-[#04805B] text-white rounded-lg hover:bg-[#059268] active:bg-[#03724E] transition-colors font-semibold"
          >
            View Transaction Details
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentCode;