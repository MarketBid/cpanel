import React from 'react';
import { motion } from 'motion/react';

interface NotificationBadgeProps {
  count?: number;
  max?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children?: React.ReactNode;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  max = 99,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  position = 'top-right',
  children,
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const showBadge = count > 0 || dot;

  const variantClasses = {
    default: 'bg-red-500 text-white',
    primary: 'bg-[var(--color-primary)] text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  const sizeClasses = {
    sm: dot ? 'h-2 w-2' : 'h-4 w-4 text-[10px]',
    md: dot ? 'h-2.5 w-2.5' : 'h-5 w-5 text-xs',
    lg: dot ? 'h-3 w-3' : 'h-6 w-6 text-sm',
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  if (!children) {
    return showBadge ? (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          inline-flex items-center justify-center rounded-full font-semibold
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
      >
        {!dot && displayCount}
        {pulse && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
        )}
      </motion.span>
    ) : null;
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      {showBadge && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            absolute flex items-center justify-center rounded-full font-semibold
            ${variantClasses[variant]} ${sizeClasses[size]} ${positionClasses[position]}
            ring-2 ring-[var(--bg-card)]
          `}
        >
          {!dot && displayCount}
          {pulse && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
          )}
        </motion.span>
      )}
    </div>
  );
};

export default NotificationBadge;

