import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { apiClient } from '../utils/api';
import Button from '../components/ui/Button';

const PaymentCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference') || params.get('trxref');

      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found in the callback URL.');
        return;
      }

      try {
        // Skip auth redirect for payment callback to prevent logout
        const response = await apiClient.post('/payment/payment-callback', { reference }, true);
        setStatus('success');
        setMessage('Payment verified successfully! Your transaction has been updated.');
        if (response.data && typeof response.data === 'object' && 'transaction_id' in response.data) {
          setTransactionId((response.data as any).transaction_id);
        }
      } catch (error: any) {
        setStatus('error');
        // Handle authentication error gracefully without logging out
        if (error.message === 'Authentication failed') {
          setMessage('Payment verification completed, but please log in again to view your transaction details.');
        } else {
          setMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
        }
      }
    };

    verifyPayment();
  }, [location]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verifying Payment</h2>
              <p className="text-neutral-600">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h2>
              <p className="text-neutral-600 mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                {transactionId && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/transactions/${transactionId}`)}
                    className="w-full"
                  >
                    View Transaction Details
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/transactions')}
                  className="w-full"
                >
                  Go to Transactions
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Verification Failed</h2>
              <p className="text-neutral-600 mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                {message.includes('log in again') ? (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/transactions')}
                    className="w-full"
                  >
                    Go to Transactions
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
