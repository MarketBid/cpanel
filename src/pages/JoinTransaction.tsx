import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import { useTransaction } from '../hooks/queries/useTransactions';
import ContractViewModal from '../components/ContractViewModal';
import Toast from '../components/ui/Toast';
import { getTransactionTypeStyles } from '../utils/statusUtils';

const JoinTransaction: React.FC = () => {
  const { transactionId: urlTransactionId } = useParams<{ transactionId?: string }>();
  const [transactionId, setTransactionId] = useState(urlTransactionId || '');
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const errorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { maskAmount } = useSensitiveInfo();
  const navigate = useNavigate();

  const {
    data: queryData,
    isLoading: loading,
    error: queryError
  } = useTransaction(urlTransactionId, !!urlTransactionId);

  const transaction = urlTransactionId ? queryData : null;

  // Sync transactionId state with URL parameter
  useEffect(() => {
    if (urlTransactionId) {
      setTransactionId(urlTransactionId);
    } else {
      setTransactionId('');
    }
  }, [urlTransactionId]);

  // Auto-dismiss error messages after 8 seconds
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set new timeout to clear error
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 8000);
    }

    // Cleanup timeout on unmount or when error changes
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;
    // Navigate to the review page with transaction ID in URL
    navigate(`/transactions/join/${transactionId}`);
  };

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || '';
    const statusCode = error?.response?.status;

    // Check for specific error messages
    if (errorMessage.toLowerCase().includes('already joined') || errorMessage.toLowerCase().includes('already a participant')) {
      return 'You have already joined this transaction.';
    }

    if (errorMessage.toLowerCase().includes('not found') || statusCode === 404) {
      return 'Transaction not found. Please check the transaction ID and try again.';
    }

    if (errorMessage.toLowerCase().includes('full') || errorMessage.toLowerCase().includes('maximum participants') || errorMessage.toLowerCase().includes('all participants')) {
      return 'This transaction already has all required participants. You cannot join at this time.';
    }

    if (errorMessage.toLowerCase().includes('missing') && errorMessage.toLowerCase().includes('participant')) {
      return 'This transaction is missing required participants. Please ensure all parties are ready before joining.';
    }

    if (errorMessage.toLowerCase().includes('cancelled') || errorMessage.toLowerCase().includes('completed')) {
      return 'This transaction is no longer available for joining. It may have been cancelled or completed.';
    }

    if (errorMessage.toLowerCase().includes('unauthorized') || statusCode === 401) {
      return 'You are not authorized to join this transaction. Please log in and try again.';
    }

    if (errorMessage.toLowerCase().includes('forbidden') || statusCode === 403) {
      return 'You do not have permission to join this transaction.';
    }

    if (statusCode === 400) {
      return errorMessage || 'Invalid request. Please check the transaction details and try again.';
    }

    if (statusCode === 500 || statusCode >= 500) {
      return 'Server error occurred. Please try again later.';
    }

    // Return the error message if available, otherwise a generic one
    return errorMessage || 'Failed to join transaction. Please try again.';
  };

  // Handle query error
  useEffect(() => {
    if (queryError) {
      setError(getErrorMessage(queryError));
    }
  }, [queryError]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    const idToUse = urlTransactionId || transactionId;
    if (!idToUse) return;

    setJoining(true);
    setMessage(null);
    setError(null);
    try {
      await apiClient.post('/transactions/join', { transaction_id: idToUse });
      setMessage('You have joined the transaction successfully!');
      setTimeout(() => {
        navigate(`/transactions/${idToUse}`);
      }, 1500);
    } catch (err: any) {
      const meaningfulError = getErrorMessage(err);
      setError(meaningfulError);
    } finally {
      setJoining(false);
    }
  };

  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy transaction ID. Please try again.');
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] py-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="bg-[var(--color-secondary)] dark:bg-[var(--color-primary)] rounded-xl p-5 mb-4 text-[var(--text-inverse)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--text-inverse)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-[var(--text-inverse)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-inverse)]">Join Transaction</h1>
              <p className="text-[13px] text-[var(--text-inverse)]/80">Enter the Transaction ID to join an existing transaction</p>
            </div>
          </div>
        </div>

        {/* Step 1 — Enter ID */}
        {!transaction && !loading && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Enter Transaction Details</h2>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)]">Please paste the Transaction ID you received from the person you are transacting with.</p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label htmlFor="transaction_id" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5">
                  Transaction ID
                </label>
                <input
                  type="text"
                  id="transaction_id"
                  name="transaction_id"
                  required
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors text-[13px] bg-[var(--bg-card)] text-[var(--text-primary)]"
                  placeholder="Enter transaction ID"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !transactionId}
                className="w-full py-2.5 text-[13.5px] font-semibold rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : 'Confirm Transaction ID'}
              </button>

              {error && (
                <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-[var(--alert-error-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-error-text)] text-[13px] flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="flex-shrink-0 text-[var(--alert-error-text)] opacity-60 hover:opacity-100">×</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-[var(--text-primary)]">Loading transaction...</span>
          </div>
        )}

        {/* Step 2 — Review & Join */}
        {transaction && !loading && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => { navigate('/transactions/join'); setError(null); setMessage(null); setAgreed(false); setTransactionId(''); }}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-[15px] font-bold text-[var(--text-primary)]">Review Transaction</h2>
              </div>

              {/* Details grid */}
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Transaction ID</div>
                      <div className="text-[var(--text-primary)] font-mono text-[12px] break-all">{transaction.transaction_id}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Service Title</div>
                      <div className="text-[var(--text-primary)] font-medium text-[13px]">{transaction.title}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Type</div>
                      {(() => {
                        const typeStyles = getTransactionTypeStyles(transaction.type);
                        return (
                          <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                            {typeStyles.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Amount</div>
                      <div className="text-2xl font-bold text-[var(--text-primary)]">₵{maskAmount(transaction.amount)}</div>
                    </div>
                    <div className="flex gap-6">
                      {transaction.sender && (
                        <div>
                          <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Sender</div>
                          <div className="text-[var(--text-primary)] font-medium text-[13px]">{transaction.sender.name}</div>
                        </div>
                      )}
                      {transaction.receiver && (
                        <div>
                          <div className="text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Receiver</div>
                          <div className="text-[var(--text-primary)] font-medium text-[13px]">{transaction.receiver.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowContractModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--color-primary-text)] bg-[var(--color-primary)] hover:opacity-90 rounded-lg text-[13px] font-medium transition-opacity"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Full Contract Details
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] mb-4">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-[var(--color-primary)] border-[var(--border-default)] rounded focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="agree" className="text-[13px] text-[var(--text-primary)]">
                  I agree to the <a href="#" className="text-[var(--color-primary)] font-medium hover:opacity-80 underline">Terms of Use</a> and understand that funds will be held in escrow until transaction completion.
                </label>
              </div>

              <button
                type="submit"
                disabled={joining || !agreed}
                className="w-full py-2.5 text-[13.5px] font-semibold rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining Transaction...
                  </span>
                ) : 'Join Transaction'}
              </button>

              {message && (
                <div className="bg-[var(--alert-success-bg)] border border-[var(--alert-success-border)] rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-[var(--alert-success-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-success-text)] font-medium text-[13px]">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-[var(--alert-error-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-error-text)] text-[13px] flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="flex-shrink-0 text-[var(--alert-error-text)] opacity-60 hover:opacity-100">×</button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {showToast && (
        <Toast message="Copied to clipboard!" onClose={() => setShowToast(false)} />
      )}
      {showContractModal && transaction && (
        <ContractViewModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          transaction={transaction}
        />
      )}
    </div>
  );
};

export default JoinTransaction;
