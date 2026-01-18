import React from 'react';

export interface DonutChartSegment {
    label: string;
    value: number;
    color: string;
    icon?: React.ReactNode;
}

interface DonutChartProps {
    segments: DonutChartSegment[];
    size?: number;
    strokeWidth?: number;
    showLegend?: boolean;
    showCenter?: boolean;
    centerLabel?: string;
    centerValue?: string | number;
    className?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
    segments,
    size = 200,
    strokeWidth = 30,
    showLegend = true,
    showCenter = true,
    centerLabel = 'Total',
    centerValue,
    className = '',
}) => {
    // Calculate total
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    // Calculate center point and radius
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;

    // Calculate segments
    let currentAngle = -90; // Start from top
    const chartSegments = segments.map((segment) => {
        const percentage = total > 0 ? (segment.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        // Calculate arc path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        ].join(' ');

        currentAngle = endAngle;

        return {
            ...segment,
            percentage,
            pathData,
            startAngle,
            endAngle,
        };
    });

    const displayValue = centerValue !== undefined ? centerValue : total;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Chart */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="var(--bg-tertiary)"
                        strokeWidth={strokeWidth}
                    />

                    {/* Segments */}
                    {chartSegments.map((segment, index) => (
                        <path
                            key={index}
                            d={segment.pathData}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
                    ))}
                </svg>

                {/* Center content */}
                {showCenter && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[var(--text-primary)]">
                                {displayValue}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                                {centerLabel}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="mt-6 w-full grid grid-cols-2 gap-3">
                    {chartSegments.map((segment, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]"
                        >
                            <div className="flex items-center gap-3">
                                {segment.icon && (
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor: `${segment.color}20`,
                                            color: segment.color
                                        }}
                                    >
                                        {segment.icon}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    {!segment.icon && (
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: segment.color }}
                                        />
                                    )}
                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                        {segment.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                    {segment.value}
                                </span>
                                <span
                                    className="text-xs font-medium px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: `${segment.color}20`,
                                        color: segment.color
                                    }}
                                >
                                    {segment.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonutChart;
