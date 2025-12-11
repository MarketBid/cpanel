import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  gradientColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
  animate?: boolean;
  className?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 200,
  showGrid = true,
  showAxes = true,
  showTooltip = true,
  gradientColor = '#0F9D7E',
  strokeColor = '#0F9D7E',
  fillOpacity = 0.2,
  animate = true,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const { maxValue, minValue, points, pathD } = useMemo(() => {
    if (data.length === 0) return { maxValue: 0, minValue: 0, points: [], pathD: '' };

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const padding = 20;
    const chartHeight = height - padding * 2;
    const chartWidth = 600;
    const pointSpacing = chartWidth / (data.length - 1 || 1);

    const normalizedPoints = data.map((d, i) => ({
      x: i * pointSpacing,
      y: chartHeight - ((d.value - min) / (max - min || 1)) * chartHeight + padding,
      value: d.value,
      label: d.label,
    }));

    // Create SVG path for area
    const path = normalizedPoints.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');
    
    const areaPath = `${path} L ${chartWidth} ${height} L 0 ${height} Z`;

    return {
      maxValue: max,
      minValue: min,
      points: normalizedPoints,
      pathD: areaPath,
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-sm text-[var(--text-tertiary)]">No data available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 600 ${height}`}
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 1, 2, 3, 4].map((i) => {
              const y = (height / 4) * i;
              return (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="var(--border-default)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <motion.path
          d={pathD}
          fill="url(#areaGradient)"
          initial={animate ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Stroke line */}
        <motion.path
          d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : {}}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 6 : 4}
              fill={strokeColor}
              stroke="var(--bg-card)"
              strokeWidth="2"
              initial={animate ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
              style={{ filter: hoveredIndex === index ? 'drop-shadow(0 0 4px rgba(15, 157, 126, 0.5))' : 'none' }}
            />
          </g>
        ))}

        {/* Axes */}
        {showAxes && (
          <>
            <line x1="0" y1={height - 20} x2="600" y2={height - 20} stroke="var(--border-medium)" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2={height} stroke="var(--border-medium)" strokeWidth="1" />
          </>
        )}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((point, index) => (
          <span
            key={index}
            className="text-xs text-[var(--text-tertiary)] whitespace-nowrap"
            style={{ fontSize: data.length > 10 ? '0.625rem' : '0.75rem' }}
          >
            {point.label}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg px-3 py-2 shadow-lg"
          style={{
            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
            top: '-60px',
          }}
        >
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            {data[hoveredIndex].label}
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            ₵{data[hoveredIndex].value.toLocaleString()}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AreaChart;

