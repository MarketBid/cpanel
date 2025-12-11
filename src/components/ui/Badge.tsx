import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', dot = false }) => {
  const variantStyles = {
    default: 'bg-[var(--status-paid-bg)] text-[var(--status-paid-text)] dark:bg-[var(--status-paid-bg)] dark:text-[var(--status-paid-text)]',
    success: 'bg-[var(--status-paid-bg)] text-[var(--status-paid-text)] dark:bg-[var(--status-paid-bg)] dark:text-[var(--status-paid-text)]',
    warning: 'bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] dark:bg-[var(--status-pending-bg)] dark:text-[var(--status-pending-text)]',
    error: 'bg-[var(--status-disputed-bg)] text-[var(--status-disputed-text)] dark:bg-[var(--status-disputed-bg)] dark:text-[var(--status-disputed-text)]',
    info: 'bg-[var(--alert-info-bg)] text-[var(--alert-info-text)] dark:bg-[var(--alert-info-bg)] dark:text-[var(--alert-info-text)]',
    neutral: 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)] dark:bg-[var(--status-cancelled-bg)] dark:text-[var(--status-cancelled-text)]',
  };

  const dotStyles = {
    default: 'bg-[var(--color-primary)]',
    success: 'bg-[var(--status-paid-text)]',
    warning: 'bg-[var(--status-pending-text)]',
    error: 'bg-[var(--status-disputed-text)]',
    info: 'bg-[var(--alert-info-text)]',
    neutral: 'bg-[var(--status-cancelled-text)]',
  };

  return (
    <span className={`badge ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} mr-1.5`} />}
      {children}
    </span>
  );
};

export default Badge;
