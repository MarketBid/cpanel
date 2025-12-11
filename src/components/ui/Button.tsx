import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]/45 focus-visible:ring-offset-[var(--bg-primary)]',
    secondary:
      'bg-[var(--color-secondary)] text-[var(--text-inverse)] hover:bg-[var(--color-secondary-light)] active:bg-[var(--color-secondary-dark)] focus-visible:ring-[var(--color-secondary)]',
    outline:
      'border-2 border-[var(--border-medium)] text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] focus-visible:ring-[var(--color-primary)]',
    ghost:
      'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] focus-visible:ring-[var(--color-primary)]',
    danger:
      'bg-[var(--status-disputed-text)] text-[var(--text-inverse)] hover:bg-[var(--status-disputed-border)] active:bg-[var(--status-disputed-text)]/80 shadow-sm hover:shadow-md focus-visible:ring-[var(--status-disputed-text)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
};

export default Button;
