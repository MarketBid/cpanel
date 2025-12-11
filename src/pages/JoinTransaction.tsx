import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, FileText } from 'lucide-react';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import { generateContractPDF } from '../utils/pdfGenerator';

const JoinTransaction: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const { maskAmount } = useSensitiveInfo();
  const navigate = useNavigate();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTransaction(null);
    setMessage(null);
    try {
      const response = await apiClient.get(`/transactions/${transactionId}`);
      setTransaction(response.data);
    } catch (err: any) {
      setError('Transaction not found. Please check the link or code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setJoining(true);
    setMessage(null);
    setError(null);
    try {
      await apiClient.post('/transactions/join', { transaction_id: transactionId });
      setMessage('You have joined the transaction successfully!');
      setTimeout(() => {
        navigate(`/transactions/${transactionId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join transaction. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="bg-[var(--color-secondary)] rounded-2xl shadow-xl p-8 mb-8 text-[var(--text-inverse)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[var(--text-inverse)]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="h-8 w-8 text-[var(--text-inverse)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-[var(--text-inverse)]">Join Transaction</h1>
              <p className="text-[var(--text-inverse)]/80">Enter the Transaction ID to join an existing transaction</p>
            </div>
          </div>
        </div>

        {!transaction && (
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-default)] p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Enter Transaction Details</h2>
              </div>
              <p className="text-[var(--text-secondary)]">Please paste the Transaction ID you received from the person you are transacting with.</p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-6">
              <div>
                <label htmlFor="transaction_id" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  id="transaction_id"
                  name="transaction_id"
                  required
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors text-base bg-[var(--bg-card)] text-[var(--text-primary)]"
                  placeholder="Enter transaction ID"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !transactionId}
                className="w-full py-3 text-base font-semibold rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : 'Confirm Transaction ID'}
              </button>

              {error && (
                <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-4 animate-slide-down">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-[var(--alert-error-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-error-text)] text-sm">{error}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {transaction && (
          <form onSubmit={handleJoin} className="space-y-6">
            {/* Transaction Preview Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-default)] p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => { setTransaction(null); setError(null); setMessage(null); setAgreed(false); setTransactionId(''); }}
                  className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                  aria-label="Back"
                >
                  <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Review Transaction</h2>
              </div>

              <div className="p-6 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-[var(--text-primary)] mb-1">Transaction ID</div>
                      <div className="flex items-center gap-2">
                        <div className="text-[var(--text-primary)] font-mono text-sm break-all bg-[var(--bg-card)] px-3 py-2 rounded-lg border border-[var(--border-default)]">{transaction.transaction_id}</div>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(transaction.transaction_id)}
                          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors flex-shrink-0"
                          title="Copy Transaction ID"
                        >
                          <Copy className="h-4 w-4 text-[var(--text-secondary)]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">Service Title</div>
                      <div className="text-[var(--text-primary)] font-medium">{transaction.title}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">Amount</div>
                      <div className="text-2xl font-bold text-[var(--text-primary)]">
                        ₵{maskAmount(transaction.amount)}
                      </div>
                    </div>

                    <div className="flex gap-8">
                      {transaction.sender && (
                        <div>
                          <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">Sender</div>
                          <div className="text-[var(--text-primary)] font-medium">{transaction.sender.name}</div>
                        </div>
                      )}
                      {transaction.receiver && (
                        <div>
                          <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">Receiver</div>
                          <div className="text-[var(--text-primary)] font-medium">{transaction.receiver.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border-default)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => generateContractPDF(transaction)}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--color-primary-text)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Full Contract Details
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] mb-6">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 text-[var(--color-primary)] border-[var(--border-medium)] rounded focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="agree" className="text-sm text-[var(--text-primary)]">
                  I agree to the <a href="#" className="text-[var(--color-primary)] font-medium hover:opacity-80 underline">Terms of Use</a> and understand that funds will be held in escrow until transaction completion.
                </label>
              </div>

              <button
                type="submit"
                disabled={joining || !agreed}
                className="w-full py-4 text-base font-bold rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {joining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining Transaction...
                  </span>
                ) : 'Join Transaction'}
              </button>

              {message && (
                <div className="bg-[var(--alert-success-bg)] border border-[var(--alert-success-border)] rounded-xl p-4 animate-slide-down">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-[var(--alert-success-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-success-text)] font-medium text-sm">{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-4 animate-slide-down">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-[var(--alert-error-text)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--alert-error-text)] text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinTransaction;
