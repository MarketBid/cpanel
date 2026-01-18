import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package,
  Plus,
  Clock,
  Truck,
  CheckCircle,
  CheckCheck,
  AlertCircle,
  ShieldCheck,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Send,
  Receipt,
} from 'lucide-react';
import { TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { useTransactions } from '../hooks/queries/useTransactions.ts';
import Toast from '../components/ui/Toast';
import RevenueForecastChart, { RevenueDataPoint } from '../components/ui/RevenueForecastChart';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import DonutChart from '../components/ui/DonutChart';

const Dashboard: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const navigate = useNavigate();

  const { data: transactions = [], isLoading: loading } = useTransactions();

  // Calculate revenue trend data for chart with sent and received
  const revenueChartData = useMemo((): RevenueDataPoint[] => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const data: RevenueDataPoint[] = [];

    let periods: number;
    let periodType: 'day' | 'month' | 'year';
    let periodLabel: (date: Date) => string;

    if (timeframe === 'weekly') {
      periods = 7;
      periodType = 'day';
      periodLabel = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === 'monthly') {
      periods = 12;
      periodType = 'month';
      periodLabel = (date) => date.toLocaleDateString('en-US', { month: 'short' });
    } else {
      periods = 5;
      periodType = 'year';
      periodLabel = (date) => date.getFullYear().toString();
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);

      // Calculate this period
      let thisPeriodStart: Date;
      let thisPeriodEnd: Date;

      if (periodType === 'day') {
        // Calculate day going backwards from today (last 7 days)
        const daysBack = i;
        thisPeriodStart = new Date(now);
        thisPeriodStart.setDate(now.getDate() - daysBack);
        thisPeriodStart.setHours(0, 0, 0, 0);
        thisPeriodEnd = new Date(thisPeriodStart);
        thisPeriodEnd.setDate(thisPeriodStart.getDate() + 1);
      } else if (periodType === 'month') {
        date.setMonth(date.getMonth() - i);
        thisPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1);
        thisPeriodStart.setHours(0, 0, 0, 0);
        thisPeriodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      } else {
        date.setFullYear(date.getFullYear() - i);
        thisPeriodStart = new Date(date.getFullYear(), 0, 1);
        thisPeriodStart.setHours(0, 0, 0, 0);
        thisPeriodEnd = new Date(date.getFullYear() + 1, 0, 1);
      }

      const thisPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate >= thisPeriodStart && tDate < thisPeriodEnd &&
          [TransactionStatus.PAID, TransactionStatus.IN_TRANSIT, TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(t.status);
      });

      const sentThisPeriod = thisPeriodTransactions.reduce((sum, t) => {
        return sum + (t.sender_id === user?.id ? t.amount : 0);
      }, 0);

      const receivedThisPeriod = thisPeriodTransactions.reduce((sum, t) => {
        return sum + (t.receiver_id === user?.id ? t.amount : 0);
      }, 0);

      data.push({
        label: periodLabel(thisPeriodStart),
        date: thisPeriodStart,
        sentThisPeriod,
        sentLastPeriod: 0,
        receivedThisPeriod,
        receivedLastPeriod: 0,
      });
    }

    return data;
  }, [transactions, timeframe, user?.id]);

  // Calculate totals for the chart - MUST be before any early returns
  const chartTotals = useMemo(() => {
    if (revenueChartData.length === 0) {
      return {
        totalSent: 0,
        totalReceived: 0,
        sentChange: 0,
        receivedChange: 0,
        sentChangePercent: 0,
        receivedChangePercent: 0,
      };
    }

    // Sum all periods
    const totalSent = revenueChartData.reduce((sum, period) => sum + period.sentThisPeriod, 0);
    const totalReceived = revenueChartData.reduce((sum, period) => sum + period.receivedThisPeriod, 0);

    return {
      totalSent,
      totalReceived,
      sentChange: 0,
      receivedChange: 0,
      sentChangePercent: 0,
      receivedChangePercent: 0,
    };
  }, [revenueChartData]);

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
      [TransactionStatus.ACK_DELIVERY]: transactions.filter(o => o.status === TransactionStatus.ACK_DELIVERY).length,
      [TransactionStatus.COMPLETED]: transactions.filter(o => o.status === TransactionStatus.COMPLETED).length,
      [TransactionStatus.DISPUTED]: transactions.filter(o => o.status === TransactionStatus.DISPUTED).length,
      [TransactionStatus.DISPUTE_RESOLVED]: transactions.filter(o => o.status === TransactionStatus.DISPUTE_RESOLVED).length,
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
          onClick: () => user?.verified ? navigate('/transactions/create') : null,
          icon: <Plus className="h-4 w-4" />,
          disabled: !user?.verified,
          tooltip: !user?.verified ? 'Please verify your account in Settings to create transactions' : undefined
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
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
      </motion.div>

      {/* Quick Stats - Fintech Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Amount Received */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80">Amount Received</span>
              <TrendingUp className="h-4 w-4 text-white/90" />
            </div>
            <div className="text-2xl font-bold mb-1">₵{maskAmount(received)}</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <TrendingUp className="h-3 w-3" />
              <span>+{analytics.revenuePercentage}% vs last week</span>
            </div>
          </div>
        </div>

        {/* Amount Sent */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80">Amount Sent</span>
              <Send className="h-4 w-4 text-white/90" />
            </div>
            <div className="text-2xl font-bold mb-1">₵{maskAmount(sent)}</div>
            <div className="text-xs text-white/70">Total payments made</div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className={`relative overflow-hidden rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow ${analytics.transactionCountChange >= 0
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-orange-500 to-red-600'
          }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80">Total Transactions</span>
              <Package className="h-4 w-4 text-white/90" />
            </div>
            <div className="text-2xl font-bold mb-1">{totalTransactions}</div>
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80">Active</span>
              <Activity className="h-4 w-4 text-white/90" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {statusCounts[TransactionStatus.PENDING] + statusCounts[TransactionStatus.PAID] + statusCounts[TransactionStatus.IN_TRANSIT]}
            </div>
            <div className="text-xs text-white/70">Pending, Paid & in-transit</div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <RevenueForecastChart
          data={revenueChartData}
          period={timeframe}
          onPeriodChange={setTimeframe}
          totalSent={chartTotals.totalSent}
          totalReceived={chartTotals.totalReceived}
          sentChange={chartTotals.sentChange}
          receivedChange={chartTotals.receivedChange}
          sentChangePercent={chartTotals.sentChangePercent}
          receivedChangePercent={chartTotals.receivedChangePercent}
          maskAmount={maskAmount}
        />
      </motion.div>

      {/* Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Breakdown - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-sm"
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
          <DonutChart
            segments={[
              {
                label: 'Pending',
                value: statusCounts[TransactionStatus.PENDING],
                color: '#b45309', // amber-700
                icon: <Clock className="h-4 w-4" />,
              },
              {
                label: 'Paid',
                value: statusCounts[TransactionStatus.PAID],
                color: '#1d4ed8', // blue-700
                icon: <CheckCircle className="h-4 w-4" />,
              },
              {
                label: 'In Transit',
                value: statusCounts[TransactionStatus.IN_TRANSIT],
                color: '#4338ca', // indigo-700
                icon: <Truck className="h-4 w-4" />,
              },
              {
                label: 'Delivered',
                value: statusCounts[TransactionStatus.DELIVERED],
                color: '#7e22ce', // purple-700
                icon: <Package className="h-4 w-4" />,
              },
              {
                label: 'Ack Delivery',
                value: statusCounts[TransactionStatus.ACK_DELIVERY],
                color: '#4338ca', // indigo-700
                icon: <CheckCheck className="h-4 w-4" />,
              },
              {
                label: 'Completed',
                value: statusCounts[TransactionStatus.COMPLETED],
                color: '#047857', // emerald-700
                icon: <CheckCircle className="h-4 w-4" />,
              },
              {
                label: 'Disputed',
                value: statusCounts[TransactionStatus.DISPUTED],
                color: '#b91c1c', // red-700
                icon: <AlertCircle className="h-4 w-4" />,
              },
              {
                label: 'Dispute Resolved',
                value: statusCounts[TransactionStatus.DISPUTE_RESOLVED],
                color: '#047857', // emerald-700
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              {
                label: 'Cancelled',
                value: statusCounts[TransactionStatus.CANCELLED],
                color: '#374151', // gray-700
                icon: <XCircle className="h-4 w-4" />,
              },
            ].filter(segment => segment.value > 0)} // Only show segments with values
            size={240}
            strokeWidth={35}
            showLegend={true}
            showCenter={true}
            centerLabel="Transactions"
            centerValue={totalTransactions}
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-sm"
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

    </div>
  );
};

export default Dashboard;
