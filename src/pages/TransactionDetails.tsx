import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Package, Users, DollarSign, Clock, CheckCircle, AlertCircle, CreditCard, Truck, Lock, MoveRight, Zap, FileText, MessageSquare } from 'lucide-react';
import ContractViewModal from '../components/ContractViewModal';
import { Transaction, TransactionStatus, ContractType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { apiClient } from '../utils/api';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';
import { useTransaction, transactionKeys, useUpdateTransactionStatus, useCancelTransaction, useRestoreTransaction, useMarkTransactionInTransit, useMarkTransactionDelivered, useMarkTransactionReceived, useMarkMilestoneComplete } from '../hooks/queries/useTransactions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTransactionTypeStyles } from '../utils/statusUtils';

const TransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showChatConfirmation, setShowChatConfirmation] = useState(false);

  // Use React Query to fetch transaction with caching
  const { data: transaction, isLoading: loading } = useTransaction(transactionId, !!transactionId || !!location.state?.transaction);

  // Fetch conversations to check if one exists for this transaction
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/chat/conversations');
      return response.data;
    },
    enabled: !!user,
  });

  const linkedConversation = conversations.find((c: any) => c.transaction_id === transaction?.transaction_id);

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
      case 'ack_delivery':
      case 'ack-delivery':
        return TransactionStatus.ACK_DELIVERY;
      case 'dispute_resolved':
      case 'dispute-resolved':
        return TransactionStatus.DISPUTE_RESOLVED;
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
        [TransactionStatus.ACK_DELIVERY]: 'Delivery Acknowledged',
        [TransactionStatus.DISPUTE_RESOLVED]: 'Dispute Resolved',
      };

      const statusLabel = statusLabels[newStatus] || event.status;
      setToastMessage(`Transaction status changed to ${statusLabel}`);
      setShowToast(true);

      // Invalidate to refetch full transaction data after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      }, 500);
    } else if (['transaction_updated', 'transaction_completed', 'dispute_resolved'].includes(event.type) && event.transactionId === transaction.transaction_id) {
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

  // Remove the manual connect/disconnect logic - it's now handled globally

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



  const handlePayment = async () => {
    if (!transaction) return;
    setUpdating(true);
    setError('');
    try {
      const response = await apiClient.post(`/payment/initiate-payment/${transaction.transaction_id}`, {});

      // Cast data to any to access potential message property safely
      const responseData = response.data as any;

      if (response.status === 'success' && responseData?.message === 'Payment already completed') {
        setToastMessage('Payment has already been completed for this transaction.');
        setShowToast(true);
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
        }, 1500);
        return;
      }

      window.location.href = responseData as string;
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenChat = () => {
    if (linkedConversation) {
      navigate(`/chats?conversationId=${linkedConversation.id}`);
    } else {
      setShowChatConfirmation(true);
    }
  };

  const executeOpenChat = async () => {
    if (!transaction || !user) return;

    const otherUserId = transaction.sender_id === user.id ? transaction.receiver_id : transaction.sender_id;
    if (!otherUserId) return;

    setUpdating(true);
    try {
      // Create conversation linked to transaction
      const response = await apiClient.post<{ id: string }>('/chat/conversations', {
        type: 'direct',
        participant_ids: [otherUserId],
        transaction_id: transaction.transaction_id
      });

      const conversationId = response.data.id;

      // Explicitly link the transaction to the conversation
      await apiClient.post(`/chat/conversations/${conversationId}/link-transaction`, {
        transaction_id: transaction.transaction_id
      });

      // Invalidate conversations to update cache
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });

      navigate(`/chats?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create conversation. Please try again.');
    } finally {
      setUpdating(false);
      setShowChatConfirmation(false);
    }
  };


  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]';
      case TransactionStatus.PAID:
        return 'bg-[var(--status-paid-bg)] text-[var(--status-paid-text)]';
      case TransactionStatus.COMPLETED:
        return 'bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]';
      case TransactionStatus.DISPUTED:
        return 'bg-[var(--status-disputed-bg)] text-[var(--status-disputed-text)]';
      case TransactionStatus.ACK_DELIVERY:
        return 'bg-[var(--status-inTransit-bg)] text-[var(--status-inTransit-text)]';
      case TransactionStatus.DISPUTE_RESOLVED:
        return 'bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]';
      default:
        return 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]';
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

    if (normalizedStatus === TransactionStatus.PAID) {
      if (isReceiver) {
        actions.push({
          label: 'Mark as In Transit',
          onClick: inTransitTransaction,
          color: 'bg-blue-600 hover:bg-blue-700',
        });
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
      if (isSender) {
        actions.push({
          label: 'Disputed',
          onClick: () => updateTransactionStatus(TransactionStatus.DISPUTED),
          color: 'bg-red-600 hover:bg-red-700',
        });
      }
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

    // When disputed, we need to determine which stage was reached before dispute
    // We'll check the transaction history or make reasonable assumptions based on data




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
          TransactionStatus.ACK_DELIVERY,
          TransactionStatus.COMPLETED,
          TransactionStatus.DISPUTED,
          TransactionStatus.DISPUTE_RESOLVED
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
          TransactionStatus.ACK_DELIVERY,
          TransactionStatus.COMPLETED,
          TransactionStatus.DISPUTED,
          TransactionStatus.DISPUTE_RESOLVED
        ].includes(normalizedStatus),
      },
      {
        key: 'delivered',
        label: 'Transaction Delivered',
        icon: Truck,
        description: 'Client Transaction Delivered',
        isComplete: [
          TransactionStatus.DELIVERED,
          TransactionStatus.ACK_DELIVERY,
          TransactionStatus.COMPLETED,
          TransactionStatus.DISPUTED,
          TransactionStatus.DISPUTE_RESOLVED
        ].includes(normalizedStatus),
      },
      {
        key: 'ack_delivery',
        label: 'Delivery Acknowledged',
        icon: CheckCircle,
        description: 'Customer has acknowledged receipt of the delivery.',
        isComplete: [
          TransactionStatus.ACK_DELIVERY,
          TransactionStatus.COMPLETED,
          TransactionStatus.DISPUTE_RESOLVED
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

    if (normalizedStatus === TransactionStatus.DISPUTED || normalizedStatus === TransactionStatus.DISPUTE_RESOLVED) {
      steps.push({
        key: 'disputed',
        label: 'Transaction Disputed',
        icon: AlertCircle,
        description: 'There is a dispute regarding this transaction.',
        isComplete: true,
      });

      steps.push({
        key: 'dispute_resolved',
        label: 'Dispute Resolved',
        icon: CheckCircle,
        description: 'The dispute has been resolved.',
        isComplete: normalizedStatus === TransactionStatus.DISPUTE_RESOLVED,
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
          <Package className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Transaction not found</h3>
          <p className="text-[var(--text-secondary)] mb-4">The transaction you're looking for doesn't exist.</p>
          <Link
            to="/transactions"
            className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-3"
          >
            ← Back to Transactions
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold text-[var(--text-primary)] mb-1">Transaction Details</h1>
              <p className="text-sm text-[var(--text-secondary)]">Track and manage your transaction</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Payment Action */}
              {normalizeStatus(transaction.status) === TransactionStatus.PENDING && isSender && (
                <div className="relative group">
                  <button
                    onClick={handlePayment}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Pay Now</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700 dark:border-gray-300">
                    Secure your transaction with Clarsix escrow protection
                  </div>
                </div>
              )}

              {/* Share Payment Link */}
              {isReceiver && transaction.payment_link && normalizeStatus(transaction.status) === TransactionStatus.PENDING && (
                <div className="relative group">
                  <button
                    onClick={() => {
                      copyToClipboard(transaction.payment_link!);
                      setToastMessage('Payment link copied to clipboard!');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700 dark:border-gray-300">
                    Copy and share this payment link with the sender
                  </div>
                </div>
              )}

              {/* Chat Action */}
              {(linkedConversation || (transaction.sender_id && transaction.receiver_id)) && (
                <div className="relative group">
                  <button
                    onClick={handleOpenChat}
                    disabled={updating}
                    className="flex items-center gap-2 px-[18px] py-[10px] bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[10px] text-sm font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700 dark:border-gray-300">
                    {linkedConversation ? 'View conversation' : 'Start a conversation with the other party'}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {availableActions.map((action, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={action.onClick}
                    disabled={updating}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm hover:shadow-md disabled:opacity-70 ${action.color}`}
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                </div>
              ))}

              {/* View Contract Button */}
              <div className="relative group">
                <button
                  onClick={() => setShowContractModal(true)}
                  className="flex items-center gap-2 px-[18px] py-[10px] bg-[var(--color-primary)] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">View Contract</span>
                  <span className="sm:hidden">Contract</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-32 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700 dark:border-gray-300">
                  View Contract Details
                </div>
              </div>

            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] text-[var(--alert-error-text)] px-4 py-3 rounded-xl mb-6 text-sm animate-slide-down">
            {error}
          </div>
        )}



        {/* Main Content Grid — details left, timeline right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 mb-8 items-start">

          {/* LEFT: Transaction Details */}
          <div className="space-y-4">

            {/* Service Details Card */}
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
              {/* Card header row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[16px] font-bold text-[var(--text-primary)]">Transaction Details</h2>
                  <span className="text-xs text-[var(--text-tertiary)]">#{transaction.transaction_id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusColor(normalizeStatus(transaction.status))}`}>
                    {normalizeStatus(transaction.status).replace('_', ' ')}
                  </span>
                  {(() => {
                    const typeStyles = getTransactionTypeStyles(transaction.type);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                        {typeStyles.label}
                      </span>
                    );
                  })()}
                </div>
                {(isSender || (user?.id === transaction.receiver_id)) && normalizeStatus(transaction.status) === TransactionStatus.PENDING && (
                  <button
                    onClick={() => navigate('/transactions/edit', { state: { editingTransaction: transaction } })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Title + description */}
              <div className="flex gap-3 p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] mb-4">
                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">{transaction.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{transaction.description}</p>
                </div>
              </div>

              {/* Payment Structure */}
              <div className="pt-4 border-t border-[var(--border-default)]">
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Payment Structure</p>
                <div className="space-y-2">
                  {(() => {
                    const feePayer = transaction.fee_config?.fee_payer || 'split';
                    const feePercentage = transaction.fee_config?.processing_fee_percentage || 3;
                    const amount = transaction.amount || 0;

                    const SenderBox = ({ children }: { children: React.ReactNode }) => (
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-3.5">
                        <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Sender Pays</p>
                        {children}
                      </div>
                    );
                    const ReceiverBox = ({ children }: { children: React.ReactNode }) => (
                      <div className="bg-[var(--color-primary-light)] rounded-xl p-3.5">
                        <p className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Receiver Gets</p>
                        {children}
                      </div>
                    );
                    const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
                      <div className={`flex justify-between text-[13px] ${bold ? 'font-bold pt-2 border-t border-[var(--border-default)] mt-1.5' : ''}`}>
                        <span className={bold ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{label}</span>
                        <span className="text-[var(--text-primary)]">{value}</span>
                      </div>
                    );

                    if (feePayer === 'sender') {
                      return (
                        <>
                          <SenderBox>
                            <Row label="Transaction Amount:" value={`₵${amount.toFixed(2)}`} />
                            <Row label={`Processing Fee (${feePercentage}%):`} value={`₵${(amount * feePercentage / 100).toFixed(2)}`} />
                            <Row label="Total to Pay:" value={`₵${(amount * (1 + feePercentage / 100)).toFixed(2)}`} bold />
                          </SenderBox>
                          <ReceiverBox>
                            <Row label="Amount Received:" value={`₵${amount.toFixed(2)}`} bold />
                          </ReceiverBox>
                        </>
                      );
                    } else if (feePayer === 'receiver') {
                      return (
                        <>
                          <SenderBox>
                            <Row label="Total to Pay:" value={`₵${amount.toFixed(2)}`} bold />
                          </SenderBox>
                          <ReceiverBox>
                            <Row label="Transaction Amount:" value={`₵${amount.toFixed(2)}`} />
                            <Row label={`Processing Fee (${feePercentage}%):`} value={`₵${(amount * feePercentage / 100).toFixed(2)} (Upfront)`} />
                            <Row label="Total Receivable:" value={`₵${amount.toFixed(2)}`} bold />
                          </ReceiverBox>
                        </>
                      );
                    } else {
                      const splitPct = feePercentage / 2;
                      const splitFee = amount * splitPct / 100;
                      const splitLabel = splitPct.toFixed(2).replace(/\.00$/, '');
                      return (
                        <>
                          <SenderBox>
                            <Row label="Transaction Amount:" value={`₵${amount.toFixed(2)}`} />
                            <Row label={`Processing Fee (${splitLabel}%):`} value={`₵${splitFee.toFixed(2)}`} />
                            <Row label="Total to Pay:" value={`₵${(amount + splitFee).toFixed(2)}`} bold />
                          </SenderBox>
                          <ReceiverBox>
                            <Row label="Transaction Amount:" value={`₵${amount.toFixed(2)}`} />
                            <Row label={`Processing Fee (${splitLabel}%):`} value={`₵${splitFee.toFixed(2)} (Upfront)`} />
                            <Row label="Total Receivable:" value={`₵${amount.toFixed(2)}`} bold />
                          </ReceiverBox>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Participants Card */}
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
              <h2 className="text-[15px] font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </h2>
              <div className="divide-y divide-[var(--border-default)]">
                {/* Sender row */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {transaction.sender?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{transaction.sender?.name || '—'}</span>
                      {user?.id === transaction.sender_id && (
                        <span className="text-[10px] bg-[var(--color-primary-light)] text-[var(--color-primary)] px-1.5 py-0.5 rounded-full font-semibold shrink-0">You</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{transaction.sender?.email || '—'}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide shrink-0">Sender</span>
                </div>

                {/* Receiver row */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {transaction.receiver?.name?.charAt(0).toUpperCase() || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{transaction.receiver?.name || 'Pending'}</span>
                      {user?.id === transaction.receiver_id && (
                        <span className="text-[10px] bg-[var(--color-primary-light)] text-[var(--color-primary)] px-1.5 py-0.5 rounded-full font-semibold shrink-0">You</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{transaction.receiver?.email || '—'}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide shrink-0">Receiver</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Activity Timeline */}
          <div className="sticky top-6">
            <div className={`rounded-xl p-5 bg-[var(--bg-card)] ${normalizeStatus(transaction.status) === TransactionStatus.COMPLETED
              ? 'border-2 border-[var(--status-completed-text)]'
              : normalizeStatus(transaction.status) === TransactionStatus.DISPUTED
                ? 'border-2 border-[var(--status-disputed-text)]'
                : 'border border-[var(--border-default)]'
              }`}>
              <h2 className="text-[15px] font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity Timeline
              </h2>

              <div className="space-y-0">
                {activityTimeline.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = step.isComplete;
                  const isDisputed = step.key === 'disputed';
                  const isCancelled = step.key === 'cancelled';
                  const isError = isDisputed || isCancelled;
                  const isLast = index === activityTimeline.length - 1;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${isError
                          ? 'bg-[var(--status-disputed-text)]'
                          : isComplete
                            ? 'bg-[var(--status-completed-text)]'
                            : 'bg-[var(--bg-tertiary)] border border-[var(--border-default)]'
                          }`}>
                          <Icon className={`h-3.5 w-3.5 ${isError
                            ? 'text-white'
                            : isComplete
                              ? 'text-white'
                              : 'text-[var(--text-tertiary)]'
                            }`} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 mt-1 mb-1 min-h-[20px] ${isComplete
                            ? 'bg-[var(--status-completed-text)]'
                            : 'bg-[var(--border-default)]'
                            }`} />
                        )}
                      </div>

                      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
                        <h3 className={`text-sm font-semibold leading-none mb-1 ${isError
                          ? 'text-[var(--status-disputed-text)]'
                          : isComplete
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-tertiary)]'
                          }`}>
                          {step.label}
                        </h3>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{step.description}</p>

                        {/* Milestones List */}
                        {step.key === 'delivered' && transaction?.contract_type === ContractType.MILESTONE_BASED && transaction.milestones && (
                          <div className="mt-3 space-y-2">
                            {transaction.milestones.map((milestone, mIndex) => {
                              const isMilestoneComplete = milestone.status === 'completed' || milestone.status === 'paid';
                              const fundsReleased = (transaction.amount * milestone.amount_percentage) / 100;
                              return (
                                <div key={milestone.id} className="bg-[var(--bg-secondary)] rounded-lg p-2.5 border border-[var(--border-default)]">
                                  <div className="flex justify-between items-start mb-1.5">
                                    <div>
                                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">M{mIndex + 1}: {milestone.description}</h4>
                                      <p className="text-[10px] text-[var(--text-tertiary)]">Due: {milestone.due_date}</p>
                                    </div>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isMilestoneComplete ? 'bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]' : 'bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]'}`}>
                                      {isMilestoneComplete ? 'Done' : 'Pending'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-default)]">
                                    <span className="text-[10px] text-[var(--text-tertiary)]">Release: <span className="font-semibold text-[var(--text-primary)]">{formatAmount(fundsReleased)}</span></span>
                                    {!isMilestoneComplete && isReceiver && (
                                      <button
                                        onClick={() => markMilestoneComplete(milestone.id)}
                                        disabled={updating}
                                        className="text-[10px] bg-[var(--color-primary)] text-white px-2 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                      >
                                        {updating ? '...' : 'Mark Done'}
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
        {
          showWaitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm">
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-8 max-w-sm w-full mx-4 shadow-2xl">
                <div className="w-16 h-16 bg-[var(--status-pending-bg)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[var(--status-pending-text)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 text-center">Please Wait</h3>
                <p className="text-[var(--text-secondary)] mb-6 text-center">Wait for the receiver to acknowledge the transaction is delivered before marking as received.</p>
                <button
                  onClick={() => setShowWaitModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] font-medium hover:bg-[var(--color-primary-hover)] transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          )
        }

        {
          showToast && (
            <Toast
              message={toastMessage || "Copied to clipboard!"}
              onClose={() => {
                setShowToast(false);
                setToastMessage('');
              }}
            />
          )
        }
        {/* Chat Confirmation Modal */}
        {
          showChatConfirmation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in p-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Start Conversation</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  Are you sure you want to start a new conversation linked to this transaction? This will allow you to discuss details directly.
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowChatConfirmation(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeOpenChat}
                    className="flex-1"
                    leftIcon={<MessageSquare className="h-4 w-4" />}
                    disabled={updating}
                  >
                    {updating ? 'Creating...' : 'Start Chat'}
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        {/* Contract View Modal */}
        {
          showContractModal && transaction && (
            <ContractViewModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              transaction={transaction}
            />
          )
        }
      </div>
  );
};

export default TransactionDetails;
