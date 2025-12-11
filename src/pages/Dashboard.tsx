import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Download,
  Filter,
  BarChart3,
  Activity,
  Send,
  Receipt,
} from 'lucide-react';
import { TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { useTransactions } from '../hooks/queries/useTransactions.ts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import AreaChart, { ChartDataPoint } from '../components/ui/AreaChart';
import Tabs, { Tab } from '../components/ui/Tabs';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ExportModal from '../components/ExportModal';

const Dashboard: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [showStatusCards, setShowStatusCards] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [showExportModal, setShowExportModal] = useState(false);
  const { user } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const navigate = useNavigate();
  
  const { data: transactions = [], isLoading: loading } = useTransactions();

  // Calculate revenue trend data for chart
  const revenueChartData = useMemo((): ChartDataPoint[] => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const data: ChartDataPoint[] = [];
    const periods = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12;
    const periodType = timeframe === 'year' ? 'month' : 'day';

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (periodType === 'month') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      const periodStart = new Date(date);
      periodStart.setHours(0, 0, 0, 0);
      if (periodType === 'month') {
        periodStart.setDate(1);
      }

      const periodEnd = new Date(periodStart);
      if (periodType === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setDate(periodEnd.getDate() + 1);
      }

      const periodTransactions = transactions.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate >= periodStart && tDate < periodEnd &&
          [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(t.status);
      });

      const periodRevenue = periodTransactions.reduce((sum, t) => {
        return sum + (t.receiver_id === user?.id ? t.amount : 0);
      }, 0);

      data.push({
        label: periodType === 'month'
          ? periodStart.toLocaleDateString('en-US', { month: 'short' })
          : periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: periodRevenue,
      });
    }

    return data;
  }, [transactions, timeframe, user?.id]);

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

  const getRecentActivity = () => {
    return transactions
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          <div className="h-10 w-40 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const analytics = calculateAnalytics();
  const statusCounts = getStatusCounts();
  const { received, sent } = getRevenueData();
  const totalTransactions = transactions.length;
  const recentActivity = getRecentActivity();

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No transactions yet"
        description="Get started by creating your first transaction to track payments and shipments."
        action={{
          label: 'Create Transaction',
          onClick: () => navigate('/transactions/create'),
          icon: <Plus className="h-4 w-4" />,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track your transactions and revenue in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--color-primary)] transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => navigate('/transactions/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </button>
        </div>
      </motion.div>

      {/* Quick Stats - Fintech Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Revenue Received */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">Revenue Received</span>
              <TrendingUp className="h-5 w-5 text-white/90" />
            </div>
            <div className="text-3xl font-bold mb-1">₵{maskAmount(received)}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <TrendingUp className="h-3 w-3" />
              <span>+{analytics.revenuePercentage}% vs last week</span>
            </div>
          </div>
        </div>

        {/* Amount Sent */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">Amount Sent</span>
              <Send className="h-5 w-5 text-white/90" />
            </div>
            <div className="text-3xl font-bold mb-1">₵{maskAmount(sent)}</div>
            <div className="text-xs text-white/70">Total payments made</div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow ${
          analytics.transactionCountChange >= 0
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">Total Transactions</span>
              <Package className="h-5 w-5 text-white/90" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalTransactions}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              {analytics.transactionCountChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {analytics.transactionCountChange >= 0 ? '+' : ''}{analytics.transactionCountPercentage}% vs last week
              </span>
            </div>
          </div>
        </div>

        {/* Active Transactions */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">Active</span>
              <Activity className="h-5 w-5 text-white/90" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {statusCounts[TransactionStatus.PENDING] + statusCounts[TransactionStatus.PAID] + statusCounts[TransactionStatus.IN_TRANSIT]}
            </div>
            <div className="text-xs text-white/70">Pending & in-transit</div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Revenue Trend</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your earnings over time</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeframe === 'week'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeframe === 'month'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeframe === 'year'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        <AreaChart
          data={revenueChartData}
          height={280}
          showGrid={true}
          showAxes={true}
          animate={true}
        />
      </motion.div>

      {/* Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Status Overview</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { status: TransactionStatus.PENDING, label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { status: TransactionStatus.PAID, label: 'Paid', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { status: TransactionStatus.IN_TRANSIT, label: 'In Transit', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { status: TransactionStatus.COMPLETED, label: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map(({ status, label, icon: Icon, color, bg }) => {
              const count = statusCounts[status];
              const percentage = totalTransactions > 0 ? (count / totalTransactions) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{count}</span>
                  </div>
                  <ProgressBar value={percentage} size="sm" variant="default" />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((transaction) => {
              const isSender = transaction.sender_id === user?.id;
              return (
                <div
                  key={transaction.id}
                  onClick={() => navigate(`/transactions/${transaction.transaction_id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${isSender ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                    {isSender ? (
                      <Send className={`h-4 w-4 ${isSender ? 'text-red-600' : 'text-green-600'}`} />
                    ) : (
                      <Receipt className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {transaction.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                      {isSender ? '-' : '+'}₵{maskAmount(transaction.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showToast && (
        <Toast
          message="Copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions}
      />
    </div>
  );
};

export default Dashboard;
