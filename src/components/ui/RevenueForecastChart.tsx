import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
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
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return data.map((point) => ({
      label: point.label,
      date: point.date,
      sentThisPeriod: point.sentThisPeriod,
      receivedThisPeriod: point.receivedThisPeriod,
    }));
  }, [data]);

  const formatYAxis = (value: number) => {
    // Check if sensitive info is hidden by testing maskAmount
    const masked = maskAmount(value);
    if (masked === '••••••') {
      // Return abbreviated masked value for Y-axis
      return '•••';
    }
    // Otherwise format normally with abbreviations
    if (value >= 1000) {
      return `₵${(value / 1000).toFixed(0)}K`;
    }
    return `₵${value.toFixed(0)}`;
  };

  const totalAmount = totalSent + totalReceived;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Amount Sent & Received</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPeriodChange('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'weekly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onPeriodChange('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'monthly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onPeriodChange('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === 'yearly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Total Display */}
      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          ₵{maskAmount(totalAmount)}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onMouseMove={(state) => {
              if (state?.activeTooltipIndex !== undefined) {
                setHoveredIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#D1D5DB" 
              opacity={0.6}
            />
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
            />
            <Tooltip content={<CustomTooltip maskAmount={maskAmount} />} />
            
            {/* Vertical reference line on hover */}
            {hoveredIndex !== null && chartData[hoveredIndex] && (
              <ReferenceLine
                x={chartData[hoveredIndex].label}
                stroke="#9CA3AF"
                strokeDasharray="4 4"
                strokeWidth={1}
                opacity={0.5}
              />
            )}

            {/* Amount Received */}
            <Line
              type="monotone"
              dataKey="receivedThisPeriod"
              stroke="#9333EA"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#9333EA' }}
              name="Amount Received"
            />

            {/* Amount Sent */}
            <Line
              type="monotone"
              dataKey="sentThisPeriod"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#3B82F6' }}
              name="Amount Sent"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amount Received</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amount Sent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecastChart;

