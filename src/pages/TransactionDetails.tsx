import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Users, DollarSign, Clock, CheckCircle, AlertCircle, CreditCard, Truck, ShoppingCart, Lock, MoveRight, Zap, FileText } from 'lucide-react';
import { generateContractPDF } from '../utils/pdfGenerator';
import { Transaction, TransactionStatus, ContractType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';
import { useTransaction, transactionKeys, useUpdateTransactionStatus, useCancelTransaction, useRestoreTransaction, useMarkTransactionInTransit, useMarkTransactionDelivered, useMarkTransactionReceived, useMarkMilestoneComplete } from '../hooks/queries/useTransactions';
import { useQueryClient } from '@tanstack/react-query';

const TransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Use React Query to fetch transaction with caching
  const { data: transaction, isLoading: loading } = useTransaction(transactionId, !!transactionId || !!location.state?.transaction);

  // Helper function to normalize status values
  const normalizeStatus = useCallback((status: string | TransactionStatus): TransactionStatus => {
    const statusStr = status.toString().toLowerCase();
    switch (statusStr) {
      case 'pending':
        return TransactionStatus.PENDING;
      case 'paid':
        return TransactionStatus.PAID;
      case 'intransit':
      case 'in_transit':
      case 'in-transit':
        return TransactionStatus.IN_TRANSIT;
      case 'delivered':
        return TransactionStatus.DELIVERED;
      case 'completed':
        return TransactionStatus.COMPLETED;
      case 'cancelled':
      case 'canceled':
        return TransactionStatus.CANCELLED;
      case 'disputed':
        return TransactionStatus.DISPUTED;
      default:
        return status as TransactionStatus;
    }
  }, []);



  // SSE connection for real-time updates
  const handleStatusChange = useCallback((event: TransactionEvent) => {
    if (!transaction || !transactionId) return;

    if (event.type === 'status_changed' && event.transactionId === transaction.transaction_id && event.status) {
      const newStatus = normalizeStatus(event.status);
      const currentTimestamp = new Date().toISOString();

      // Update the transaction in React Query cache immediately
      queryClient.setQueryData<Transaction>(transactionKeys.detail(transaction.transaction_id), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, status: newStatus, updated_at: event.timestamp || currentTimestamp };
      });

      // Also update in the transactions list cache
      queryClient.setQueryData<Transaction[]>(transactionKeys.lists(), (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((o) =>
          o.transaction_id === transaction.transaction_id
            ? { ...o, status: newStatus, updated_at: event.timestamp || currentTimestamp }
            : o
        );
      });



      // Show notification
      const statusLabels: Record<string, string> = {
        [TransactionStatus.PENDING]: 'Pending',
        [TransactionStatus.PAID]: 'Paid',
        [TransactionStatus.IN_TRANSIT]: 'In Transit',
        [TransactionStatus.DELIVERED]: 'Delivered',
        [TransactionStatus.COMPLETED]: 'Completed',
        [TransactionStatus.CANCELLED]: 'Cancelled',
        [TransactionStatus.DISPUTED]: 'Disputed',
      };

      const statusLabel = statusLabels[newStatus] || event.status;
      setToastMessage(`Transaction status changed to ${statusLabel}`);
      setShowToast(true);

      // Invalidate to refetch full transaction data after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      }, 500);
    } else if (event.type === 'transaction_updated' && event.transactionId === transaction.transaction_id) {
      // Invalidate to refetch full transaction data
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    } else if ((event.type === 'receiver_assigned' || event.type === 'sender_assigned') && event.transactionId === transaction.transaction_id) {
      // Invalidate to refetch when participants are assigned
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    }
  }, [transaction, transactionId, normalizeStatus, queryClient]);

  useTransactionEvents({
    enabled: isAuthenticated && !!transaction,
    onStatusChange: handleStatusChange,
  });

  // If transaction is passed from location state, set it in cache
  useEffect(() => {
    if (location.state?.transaction && transactionId) {
      queryClient.setQueryData(transactionKeys.detail(transactionId), location.state.transaction);
    }
  }, [location.state, transactionId, queryClient]);

  // React Query mutations
  const updateTransactionStatusMutation = useUpdateTransactionStatus();
  const cancelTransactionMutation = useCancelTransaction();
  const restoreTransactionMutation = useRestoreTransaction();
  const inTransitTransactionMutation = useMarkTransactionInTransit();
  const receivedTransactionMutation = useMarkTransactionReceived();
  const deliveredTransactionMutation = useMarkTransactionDelivered();
  const markMilestoneCompleteMutation = useMarkMilestoneComplete();

  const updateTransactionStatus = async (newStatus: TransactionStatus) => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: newStatus });
    } catch (error) {
      setError('Failed to update transaction status');
    } finally {
      setUpdating(false);
    }
  };

  const cancelTransaction = async () => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await cancelTransactionMutation.mutateAsync(transaction.transaction_id);
    } catch (error) {
      setError('Failed to cancel transaction');
    } finally {
      setUpdating(false);
    }
  };

  const restoreTransaction = async () => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await restoreTransactionMutation.mutateAsync(transaction.transaction_id);
    } catch (error) {
      setError('Failed to restore transaction');
    } finally {
      setUpdating(false);
    }
  };

  const inTransitTransaction = async () => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await inTransitTransactionMutation.mutateAsync(transaction.transaction_id);
    } catch (error) {
      setError('Failed to mark as in transit');
    } finally {
      setUpdating(false);
    }
  };

  const receivedTransaction = async () => {
    if (!transaction) return;
    const normalizedStatus = normalizeStatus(transaction.status);
    if (normalizedStatus === TransactionStatus.IN_TRANSIT) {
      setShowWaitModal(true);
      return;
    }
    setUpdating(true);
    setError('');
    try {
      await receivedTransactionMutation.mutateAsync(transaction.transaction_id);
    } catch (error) {
      setError('Failed to mark as acknowledged');
    } finally {
      setUpdating(false);
    }
  };

  const deliveredTransaction = async () => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await deliveredTransactionMutation.mutateAsync(transaction.transaction_id);
    } catch (error) {
      setError('Failed to mark as delivered');
    } finally {
      setUpdating(false);
    }
  };

  const markMilestoneComplete = async (milestoneId: string) => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      await markMilestoneCompleteMutation.mutateAsync({ transactionId: transaction.transaction_id, milestoneId });
      setToastMessage('Milestone marked as complete');
      setShowToast(true);
    } catch (error) {
      setError('Failed to mark milestone as complete');
    } finally {
      setUpdating(false);
    }
  };



  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.PAID:
        return 'bg-blue-100 text-blue-800';
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.DISPUTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = useCallback(() => {
    if (!transaction || !user) return [];
    const isSender = String(transaction.sender_id) === String(user.id);
    const isReceiver = String(transaction.receiver_id) === String(user.id);

    // Normalize status for consistent comparison
    const normalizedStatus = normalizeStatus(transaction.status);
    const actions = [];

    if (normalizedStatus === TransactionStatus.PENDING && (isSender || isReceiver)) {
      actions.push({
        label: 'Decline',
        onClick: cancelTransaction,
        color: 'bg-red-600 hover:bg-red-700',
      });
    }

    if (normalizedStatus === TransactionStatus.CANCELLED && isReceiver) {
      actions.push({
        label: 'Restore Transaction',
        onClick: restoreTransaction,
        color: 'bg-blue-600 hover:bg-blue-700',
      });
    }

    if (normalizedStatus === TransactionStatus.PAID && isReceiver) {
      actions.push({
        label: 'Mark as In Transit',
        onClick: inTransitTransaction,
        color: 'bg-blue-600 hover:bg-blue-700',
      });
    }

    if (normalizedStatus === TransactionStatus.IN_TRANSIT) {
      if (isReceiver) {
        actions.push({
          label: 'Mark as Delivered',
          onClick: deliveredTransaction,
          color: 'bg-green-600 hover:bg-green-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
      if (isSender) {
        // Sender can't mark as acknowledged while in transit - they need to wait for delivery
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
    }

    if (normalizedStatus === TransactionStatus.DELIVERED) {
      if (isReceiver) {
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
      if (isSender) {
        actions.push({
          label: 'Mark as Acknowledged',
          onClick: receivedTransaction,
          color: 'bg-green-600 hover:bg-green-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
    }

    return actions;
  }, [transaction, user, normalizeStatus, cancelTransaction, restoreTransaction, inTransitTransaction, deliveredTransaction, receivedTransaction, updateTransactionStatus]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatAmount = (amount: number | undefined | null) => {
    // Handle undefined or null amounts
    if (amount === undefined || amount === null) {
      return `₵${maskAmount(undefined)}`;
    }
    return `₵${maskAmount(amount)}`;
  };

  // Define getActivityTimeline hook BEFORE any conditional returns
  const getActivityTimeline = useCallback(() => {
    if (!transaction) return [];

    // Normalize status for consistent comparison
    const normalizedStatus = normalizeStatus(transaction.status);

    const steps = [
      {
        key: 'joined',
        label: 'Both Parties Joined',
        icon: Users,
        description: 'Customer and seller have both joined.',
        isComplete: transaction.sender_id != null && transaction.receiver_id != null,
      },
      {
        key: 'paid',
        label: 'Funds in Clarsix Hold',
        icon: Lock,
        description: `Payment of ${formatAmount(transaction.amount)} received.`,
        isComplete: [
          TransactionStatus.PAID,
          TransactionStatus.IN_TRANSIT,
          TransactionStatus.DELIVERED,
          TransactionStatus.COMPLETED
        ].includes(normalizedStatus),
      },
      {
        key: 'in_transit',
        label: 'In Transit',
        icon: MoveRight,
        description: 'Transaction is now in transit.',
        isComplete: [
          TransactionStatus.IN_TRANSIT,
          TransactionStatus.DELIVERED,
          TransactionStatus.COMPLETED
        ].includes(normalizedStatus),
      },
      {
        key: 'delivered',
        label: 'Transaction Delivered',
        icon: Truck,
        description: 'Transaction delivered to the provided address.',
        isComplete: [
          TransactionStatus.DELIVERED,
          TransactionStatus.COMPLETED
        ].includes(normalizedStatus),
      },
      {
        key: 'completed',
        label: 'Funds Released',
        icon: CheckCircle,
        description: 'Transaction has been completed successfully.',
        isComplete: normalizedStatus === TransactionStatus.COMPLETED,
      },
    ];

    if (normalizedStatus === TransactionStatus.DISPUTED) {
      steps.push({
        key: 'disputed',
        label: 'Transaction Disputed',
        icon: AlertCircle,
        description: 'There is a dispute regarding this transaction.',
        isComplete: true,
      });
    }

    if (normalizedStatus === TransactionStatus.CANCELLED) {
      steps.push({
        key: 'cancelled',
        label: 'Transaction Cancelled',
        icon: AlertCircle,
        description: 'Transaction has been cancelled.',
        isComplete: true,
      });
    }

    return steps;
  }, [transaction, normalizeStatus, formatAmount]);

  // Calculate derived values - these are not hooks, just regular variables
  // But we need to handle the case where transaction might be null
  const isSender = transaction?.sender_id === user?.id;
  const isReceiver = transaction?.receiver_id === user?.id;


  // Memoize available actions and timeline to prevent unnecessary recalculations
  // These call the useCallback functions, but only if transaction exists
  const availableActions = transaction ? getAvailableActions() : [];
  const activityTimeline = transaction ? getActivityTimeline() : [];

  // Early returns AFTER all hooks have been called
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction not found</h3>
          <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <Link
            to="/transactions"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Transactions</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Transaction Details</h1>
              <p className="text-sm sm:text-base text-neutral-600">Track and manage your transaction</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Contract Button */}
              <button
                onClick={() => generateContractPDF(transaction)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm hover:shadow-md"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">View Contract</span>
                <span className="sm:hidden">Contract</span>
              </button>

              {/* Real-time indicator */}

            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm animate-slide-down">
            {error}
          </div>
        )}



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Service Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-neutral-900" />
                    Transaction Details
                  </h2>
                  <span className="text-sm text-neutral-500">#{transaction.transaction_id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(normalizeStatus(transaction.status))}`}>
                    {normalizeStatus(transaction.status).replace('_', ' ')}
                  </span>
                </div>
                {(isSender || (user?.id === transaction.receiver_id)) && normalizeStatus(transaction.status) === TransactionStatus.PENDING && (
                  <button
                    onClick={() => navigate('/transactions/edit', { state: { editingTransaction: transaction } })}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Edit Transaction</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-100">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <Package className="h-8 w-8 sm:h-12 sm:w-12 text-neutral-900" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-base sm:text-lg text-neutral-900 mb-2">{transaction.title}</h3>
                  <p className="text-sm sm:text-base text-neutral-600 mb-3">{transaction.description}</p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs sm:text-sm text-neutral-500 mb-1">Total Amount</div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatAmount(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-medium">₵0.00</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span className="font-medium">₵0.00</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-neutral-900" />
                Participants
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Sender */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                      {transaction.sender?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-neutral-900">Sender</h3>
                        {user?.id === transaction.sender_id && (
                          <span className="text-xs bg-gradient-to-r from-neutral-800 to-neutral-900 text-white px-2 py-1 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-neutral-900">{transaction.sender?.name}</p>
                      <p className="text-xs sm:text-sm text-neutral-600">{transaction.sender?.email}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1">Contact</div>
                      <div className="text-neutral-900">{transaction.sender?.contact || 'N/A'}</div>
                    </div>

                  </div>
                </div>

                {/* Receiver */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                      {transaction.receiver?.name?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-neutral-900">Receiver</h3>
                        {user?.id === transaction.receiver_id && (
                          <span className="text-xs bg-gradient-to-r from-neutral-700 to-neutral-800 text-white px-2 py-1 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-neutral-900">{transaction.receiver?.name}</p>
                      <p className="text-xs sm:text-sm text-neutral-600">{transaction.receiver?.email}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1">Contact</div>
                      <div className="text-neutral-900">{transaction.receiver?.contact || 'N/A'}</div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Card */}
            {normalizeStatus(transaction.status) === TransactionStatus.PENDING && isSender && (
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Ready to Pay?</h3>
                <p className="text-sm text-white/80 mb-4">Secure your transaction with Clarsix escrow protection</p>
                <button
                  onClick={() => navigate(`/payment/initiate-payment/${transaction.transaction_id}`)}
                  className="w-full py-3 px-4 rounded-xl bg-white text-emerald-600 font-bold hover:bg-white/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  <DollarSign className="h-5 w-5" />
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Quick Actions */}
            {availableActions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {availableActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={updating}
                      className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md ${action.color}`}
                    >
                      {updating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </span>
                      ) : action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-neutral-900" />
                Activity Timeline
              </h2>

              <div className="space-y-6">
                {activityTimeline.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = step.isComplete;

                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isComplete
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'
                          : 'bg-neutral-100'
                          }`}>
                          <Icon className={`h-5 w-5 ${isComplete ? 'text-white' : 'text-neutral-400'
                            }`} />
                        </div>
                        {index < activityTimeline.length - 1 && (
                          <div className={`w-0.5 h-full mt-2 ${isComplete ? 'bg-gradient-to-b from-green-500 to-emerald-600' : 'bg-neutral-200'
                            }`}></div>
                        )}
                      </div>

                      <div className="flex-1 pb-8">
                        <h3 className={`font-semibold mb-1 ${isComplete ? 'text-neutral-900' : 'text-neutral-500'
                          }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-neutral-600">{step.description}</p>

                        {/* Milestones List */}
                        {step.key === 'delivered' && transaction?.contract_type === ContractType.MILESTONE_BASED && transaction.milestones && (
                          <div className="mt-4 space-y-3">
                            {transaction.milestones.map((milestone, mIndex) => {
                              const isMilestoneComplete = milestone.status === 'completed' || milestone.status === 'paid';
                              const fundsReleased = (transaction.amount * milestone.amount_percentage) / 100;

                              return (
                                <div key={milestone.id} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="text-sm font-medium text-neutral-900">Milestone {mIndex + 1}: {milestone.description}</h4>
                                      <p className="text-xs text-neutral-500 mt-1">Due: {milestone.due_date}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isMilestoneComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {isMilestoneComplete ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200">
                                    <div className="text-xs text-neutral-600">
                                      Funds to release: <span className="font-medium text-neutral-900">{formatAmount(fundsReleased)}</span>
                                    </div>

                                    {!isMilestoneComplete && isReceiver && (
                                      <button
                                        onClick={() => markMilestoneComplete(milestone.id)}
                                        disabled={updating}
                                        className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                      >
                                        {updating ? 'Updating...' : 'Mark Complete'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showWaitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full mx-4 shadow-2xl">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">Please Wait</h3>
              <p className="text-neutral-600 mb-6 text-center">Wait for the receiver to acknowledge the transaction is delivered before marking as received.</p>
              <button
                onClick={() => setShowWaitModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {showToast && (
          <Toast
            message={toastMessage || "Copied to clipboard!"}
            onClose={() => {
              setShowToast(false);
              setToastMessage('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
