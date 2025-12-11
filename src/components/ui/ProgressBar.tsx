import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animate = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-[var(--color-primary)]',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]',
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">{label}</span>
          <span className="text-[var(--text-primary)] font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${variantClasses[variant]}`}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

