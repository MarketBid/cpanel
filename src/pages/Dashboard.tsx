import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Clock,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Eye,
  Copy,
} from 'lucide-react';
import { TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { useTransactions } from '../hooks/queries/useTransactions.ts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';

const Dashboard: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [showStatusCards, setShowStatusCards] = useState(true);
  const { user } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const navigate = useNavigate();
  
  // Use React Query to fetch transactions with caching
  const { data: transactions = [], isLoading: loading } = useTransactions();

  const calculateAnalytics = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setMilliseconds(-1);

    const currentWeekTransactions = transactions.filter(transaction =>
      new Date(transaction.created_at) >= currentWeekStart
    );

    const previousWeekTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate >= previousWeekStart && transactionDate <= previousWeekEnd;
    });

    const currentWeekAmount = currentWeekTransactions.reduce((sum, transaction) => {
      if ([TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status)) {
        return sum + (transaction.sender_id === user?.id ? 0 : transaction.amount);
      }
      return sum;
    }, 0);

    const previousWeekAmount = previousWeekTransactions.reduce((sum, transaction) => {
      if ([TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status)) {
        return sum + (transaction.sender_id === user?.id ? 0 : transaction.amount);
      }
      return sum;
    }, 0);

    const transactionCountChange = currentWeekTransactions.length - previousWeekTransactions.length;
    const transactionCountPercentage = previousWeekTransactions.length > 0
      ? ((transactionCountChange / previousWeekTransactions.length) * 100).toFixed(1)
      : currentWeekTransactions.length > 0 ? '100' : '0';

    const revenueChange = currentWeekAmount - previousWeekAmount;
    const revenuePercentage = previousWeekAmount > 0
      ? ((revenueChange / previousWeekAmount) * 100).toFixed(1)
      : currentWeekAmount > 0 ? '100' : '0';

    return {
      currentWeekTransactions: currentWeekTransactions.length,
      previousWeekTransactions: previousWeekTransactions.length,
      transactionCountChange,
      transactionCountPercentage,
      currentWeekAmount,
      previousWeekAmount,
      revenueChange,
      revenuePercentage,
    };
  };

  const getStatusCounts = () => {
    return {
      [TransactionStatus.PENDING]: transactions.filter(o => o.status === TransactionStatus.PENDING).length,
      [TransactionStatus.PAID]: transactions.filter(o => o.status === TransactionStatus.PAID).length,
      [TransactionStatus.IN_TRANSIT]: transactions.filter(o => o.status === TransactionStatus.IN_TRANSIT).length,
      [TransactionStatus.DELIVERED]: transactions.filter(o => o.status === TransactionStatus.DELIVERED).length,
      [TransactionStatus.COMPLETED]: transactions.filter(o => o.status === TransactionStatus.COMPLETED).length,
      [TransactionStatus.DISPUTED]: transactions.filter(o => o.status === TransactionStatus.DISPUTED).length,
      [TransactionStatus.CANCELLED]: transactions.filter(o => o.status === TransactionStatus.CANCELLED).length,
    };
  };

  const getRevenueData = () => {
    const received = transactions.reduce((sum, transaction) => {
      if (transaction.receiver_id === user?.id &&
          [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status)) {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    const sent = transactions.reduce((sum, transaction) => {
      if (transaction.sender_id === user?.id &&
          [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status)) {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    return { received, sent };
  };

  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStatusClick = (status: TransactionStatus) => {
    navigate('/transactions', { state: { filterStatus: status } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const analytics = calculateAnalytics();
  const statusCounts = getStatusCounts();
  const { received, sent } = getRevenueData();
  const totalTransactions = transactions.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Track your transactions and revenue in real-time
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions/create')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Create Transaction</span>
        </button>
      </div>

      {/* Analytics Cards - Credit Card Design */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Revenue Received Card */}
        <div className="relative overflow-hidden rounded-lg lg:rounded-2xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 lg:hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700"></div>
          <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <p className="text-xs lg:text-sm text-white/80 font-medium tracking-wide uppercase">Revenue Received</p>
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white/90" />
            </div>
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">₵{maskAmount(received)}</h3>
            <p className="hidden lg:block text-xs text-white/70 mt-2 lg:mt-3">Total amount received from completed transactions</p>
          </div>
        </div>

        {/* Amount Sent Card */}
        <div className="relative overflow-hidden rounded-lg lg:rounded-2xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 lg:hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>
          <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24"></div>

          <div className="relative p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <p className="text-xs lg:text-sm text-white/80 font-medium tracking-wide uppercase">Amount Sent</p>
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white/90" />
            </div>
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">₵{maskAmount(sent)}</h3>
            <p className="hidden lg:block text-xs text-white/70 mt-2 lg:mt-3">Total amount sent to secure transactions</p>
          </div>
        </div>

        {/* Transaction Volume Card */}
        <div className="relative overflow-hidden rounded-lg lg:rounded-2xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 lg:hover:-translate-y-1">
          <div className={`absolute inset-0 ${analytics.transactionCountChange >= 0
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700'
            : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-700'}`}></div>
          <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <p className="text-xs lg:text-sm text-white/80 font-medium tracking-wide uppercase">Total Transactions</p>
              {analytics.transactionCountChange >= 0 ? (
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white/90" />
              ) : (
                <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-white/90" />
              )}
            </div>
            <h3 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">{totalTransactions}</h3>
            <div className="hidden lg:flex items-center gap-2 mt-2 lg:mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                {analytics.transactionCountChange >= 0 ? '+' : ''}{analytics.transactionCountChange} ({analytics.transactionCountChange >= 0 ? '+' : ''}{analytics.transactionCountPercentage}%)
              </span>
              <p className="text-xs text-white/70">vs last week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Status Breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-base font-semibold text-neutral-900">Transaction Status Overview</h2>
          <button
            onClick={() => setShowStatusCards(!showStatusCards)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {showStatusCards ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 ${!showStatusCards ? 'hidden lg:grid' : ''}`}>
          <button
            onClick={() => handleStatusClick(TransactionStatus.PENDING)}
            className="flex flex-col items-center p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-orange-700">{statusCounts[TransactionStatus.PENDING]}</span>
            <span className="text-[10px] sm:text-xs text-orange-600 font-medium mt-1">Pending</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.PAID)}
            className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
          >
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-green-700">{statusCounts[TransactionStatus.PAID]}</span>
            <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-1">Paid</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.IN_TRANSIT)}
            className="flex flex-col items-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-blue-700">{statusCounts[TransactionStatus.IN_TRANSIT]}</span>
            <span className="text-[10px] sm:text-xs text-blue-600 font-medium mt-1">In Transit</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.DELIVERED)}
            className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
          >
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-green-700">{statusCounts[TransactionStatus.DELIVERED]}</span>
            <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-1">Delivered</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.COMPLETED)}
            className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
          >
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-green-700">{statusCounts[TransactionStatus.COMPLETED]}</span>
            <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-1">Completed</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.DISPUTED)}
            className="flex flex-col items-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-red-700">{statusCounts[TransactionStatus.DISPUTED]}</span>
            <span className="text-[10px] sm:text-xs text-red-600 font-medium mt-1">Disputed</span>
          </button>

          <button
            onClick={() => handleStatusClick(TransactionStatus.CANCELLED)}
            className="flex flex-col items-center p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-600 mb-1.5 sm:mb-2" />
            <span className="text-xl sm:text-2xl font-bold text-neutral-700">{statusCounts[TransactionStatus.CANCELLED]}</span>
            <span className="text-[10px] sm:text-xs text-neutral-600 font-medium mt-1">Cancelled</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="p-4 sm:p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-neutral-900">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {transactions.slice(0, 5).map((transaction) => {
            const isSender = transaction.sender_id === user?.id;
            const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
              [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
              [TransactionStatus.PAID]: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50' },
              [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50' },
              [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50' },
              [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-orange-700', bg: 'bg-orange-50' },
              [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-red-700', bg: 'bg-red-50' },
              [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-neutral-700', bg: 'bg-neutral-100' },
            };

            const status = statusConfig[transaction.status as TransactionStatus] || {
              label: String(transaction.status || 'Unknown').replace('_', ' '),
              color: 'text-neutral-700',
              bg: 'bg-neutral-50'
            };

            return (
              <div key={transaction.id} className="bg-white border border-neutral-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{transaction.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{transaction.description?.slice(0, 30)}...</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color} whitespace-nowrap ml-2`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Amount</p>
                    <p className={`text-sm font-semibold ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                      {isSender ? '-' : '+'}₵{maskAmount(transaction.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 mb-0.5">Date</p>
                    <p className="text-xs text-neutral-700">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Transaction</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {transactions.slice(0, 5).map((transaction) => {
                const isSender = transaction.sender_id === user?.id;
                const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
                  [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
                  [TransactionStatus.PAID]: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50' },
                  [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50' },
                  [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50' },
                  [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-orange-700', bg: 'bg-orange-50' },
                  [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-red-700', bg: 'bg-red-50' },
                  [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-neutral-700', bg: 'bg-neutral-100' },
                };

                const status = statusConfig[transaction.status as TransactionStatus] || {
                  label: String(transaction.status || 'Unknown').replace('_', ' '),
                  color: 'text-neutral-700',
                  bg: 'bg-neutral-50'
                };

                return (
                  <tr key={transaction.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{transaction.title}</p>
                          <p className="text-xs text-neutral-500 truncate">{transaction.description?.slice(0, 30)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-neutral-700">{transaction.transaction_id}</span>
                        <button
                          onClick={(e) => copyToClipboard(transaction.transaction_id, e)}
                          className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Copy className="h-3 w-3 text-neutral-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                        {isSender ? '-' : '+'}₵{maskAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-700">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-')} mr-1.5`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showToast && (
        <Toast
          message="Copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
