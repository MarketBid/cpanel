import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Layers,
  Activity,
} from 'lucide-react';
import { TransactionStatus } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { useTransactions } from '../hooks/queries/useTransactions.ts';
import Toast from '../components/ui/Toast';
import RevenueForecastChart, { RevenueDataPoint } from '../components/ui/RevenueForecastChart';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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
        <div className="rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--color-primary)]">Amount Received</span>
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">₵{maskAmount(received)}</div>
          <div className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+{analytics.revenuePercentage}% vs last week</span>
          </div>
        </div>

        {/* Amount Sent */}
        <div className="rounded-2xl bg-blue-500/[0.08] border border-blue-500/20 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-500">Amount Sent</span>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">₵{maskAmount(sent)}</div>
          <div className="text-xs text-blue-500/70">Total payments made</div>
        </div>

        {/* Total Transactions */}
        <div className="rounded-2xl bg-violet-500/[0.08] border border-violet-500/20 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-violet-500">Total Transactions</span>
            <Layers className="h-4 w-4 text-violet-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{totalTransactions}</div>
          <div className="flex items-center gap-1 text-xs text-violet-500 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+{analytics.transactionCountChange} vs last month</span>
          </div>
        </div>

        {/* Active Transactions */}
        <div className="rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-amber-500">Active</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {statusCounts[TransactionStatus.PENDING] + statusCounts[TransactionStatus.PAID] + statusCounts[TransactionStatus.IN_TRANSIT]}
          </div>
          <div className="text-xs text-amber-500/70">Pending, paid & in-transit</div>
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
          <div className="space-y-4">
            {[
              { label: 'Pending', count: statusCounts[TransactionStatus.PENDING], dot: 'bg-gray-400' },
              { label: 'In Transit', count: statusCounts[TransactionStatus.IN_TRANSIT], dot: 'bg-blue-500' },
              { label: 'Completed', count: statusCounts[TransactionStatus.COMPLETED], dot: 'bg-[var(--color-primary)]' },
              { label: 'Acknowledged', count: statusCounts[TransactionStatus.ACK_DELIVERY], dot: 'bg-blue-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                  <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{item.count}</span>
              </div>
            ))}
          </div>
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
          <div className="space-y-1">
            {recentActivity.map((transaction) => {
              const normalizedStatus = (() => {
                const s = transaction.status?.toString().toLowerCase();
                if (s === 'ack_delivery' || s === 'ack-delivery') return TransactionStatus.ACK_DELIVERY;
                if (s === 'in_transit' || s === 'intransit') return TransactionStatus.IN_TRANSIT;
                if (s === 'completed') return TransactionStatus.COMPLETED;
                if (s === 'delivered') return TransactionStatus.DELIVERED;
                if (s === 'paid') return TransactionStatus.PAID;
                if (s === 'disputed') return TransactionStatus.DISPUTED;
                if (s === 'cancelled' || s === 'canceled') return TransactionStatus.CANCELLED;
                return TransactionStatus.PENDING;
              })();

              const dotColor =
                normalizedStatus === TransactionStatus.COMPLETED || normalizedStatus === TransactionStatus.ACK_DELIVERY || normalizedStatus === TransactionStatus.DELIVERED
                  ? 'bg-[var(--color-primary)]'
                  : normalizedStatus === TransactionStatus.IN_TRANSIT || normalizedStatus === TransactionStatus.PAID
                    ? 'bg-blue-500'
                    : normalizedStatus === TransactionStatus.DISPUTED
                      ? 'bg-red-500'
                      : 'bg-gray-400';

              const otherPartyName = transaction.sender_id === user?.id
                ? (transaction.receiver?.name || 'Counterparty')
                : (transaction.sender?.name || 'Counterparty');

              const activityText = (() => {
                switch (normalizedStatus) {
                  case TransactionStatus.ACK_DELIVERY: return `${otherPartyName} acknowledged delivery on ${transaction.title}`;
                  case TransactionStatus.COMPLETED: return `Payment received for ${transaction.title}`;
                  case TransactionStatus.IN_TRANSIT: return `${transaction.title} marked In Transit`;
                  case TransactionStatus.DELIVERED: return `${transaction.title} has been delivered`;
                  case TransactionStatus.PAID: return `Payment secured for ${transaction.title}`;
                  case TransactionStatus.DISPUTED: return `Dispute raised on ${transaction.title}`;
                  case TransactionStatus.CANCELLED: return `${transaction.title} was cancelled`;
                  default: return `New transaction created: ${transaction.title}`;
                }
              })();

              const relativeTime = (() => {
                const diffMs = Date.now() - new Date(transaction.created_at).getTime();
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffHours / 24);
                if (diffHours < 1) return 'Just now';
                if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                if (diffDays === 1) return 'Yesterday';
                return `${diffDays} days ago`;
              })();

              return (
                <div
                  key={transaction.id}
                  onClick={() => navigate(`/transactions/${transaction.transaction_id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                      {activityText}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{relativeTime}</p>
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
