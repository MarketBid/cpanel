import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface RevenueDataPoint {
  label: string;
  date: Date;
  sentThisPeriod: number;
  sentLastPeriod: number;
  receivedThisPeriod: number;
  receivedLastPeriod: number;
}

interface RevenueForecastChartProps {
  data: RevenueDataPoint[];
  period: 'weekly' | 'monthly' | 'yearly';
  onPeriodChange: (period: 'weekly' | 'monthly' | 'yearly') => void;
  totalSent: number;
  totalReceived: number;
  sentChange: number;
  receivedChange: number;
  sentChangePercent: number;
  receivedChangePercent: number;
  maskAmount?: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label, maskAmount }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const sentThis = payload.find((p: any) => p.dataKey === 'sentThisPeriod');
  const receivedThis = payload.find((p: any) => p.dataKey === 'receivedThisPeriod');
  const formatAmount = maskAmount || ((amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-4 min-w-[200px]"
    >
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">{label}</div>
      
      {receivedThis && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#318A6E]" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Amount Received</span>
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            ₵{formatAmount(receivedThis.value)}
          </div>
        </div>
      )}

      {sentThis && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Amount Sent</span>
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            ₵{formatAmount(sentThis.value)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({
  data,
  period,
  onPeriodChange,
  totalSent,
  totalReceived,
  sentChange,
  receivedChange,
  sentChangePercent,
  receivedChangePercent,
  maskAmount = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
}) => {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      label: point.label,
      date: point.date,
      sentThisPeriod: point.sentThisPeriod,
      receivedThisPeriod: point.receivedThisPeriod,
    }));
  }, [data]);

  const formatYAxis = (value: number) => {
    const masked = maskAmount(value);
    if (masked === '••••••') return '•••';
    if (value >= 1000) {
      const k = value / 1000;
      return `₵${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `₵${value.toFixed(0)}`;
  };

  const totalAmount = totalSent + totalReceived;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Amount Sent & Received</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPeriodChange('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'weekly'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onPeriodChange('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'monthly'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onPeriodChange('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'yearly'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Total Display */}
      <div className="mb-6">
        <div className="text-4xl font-bold text-[var(--text-primary)]">
          ₵{maskAmount(totalAmount)}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            barGap={2}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={65}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
            />
            <Tooltip content={<CustomTooltip maskAmount={maskAmount} />} />
            <Bar dataKey="receivedThisPeriod" fill="#318A6E" radius={[4, 4, 0, 0]} name="Amount Received" />
            <Bar dataKey="sentThisPeriod" fill="#D1D5DB" radius={[4, 4, 0, 0]} name="Amount Sent" />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#318A6E]" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amount Received</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amount Sent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecastChart;

