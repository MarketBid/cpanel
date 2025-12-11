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
      'bg-[#04805B] text-white hover:bg-[#059268] active:bg-[#03724E] shadow-[0_8px_24px_rgba(4,128,91,0.35)] focus-visible:ring-[rgba(4,128,91,0.45)] focus-visible:ring-offset-[#E6F3EE]',
    secondary:
      'bg-[#1A1A1A] text-white hover:bg-[#2D2D2D] active:bg-[#111111] focus-visible:ring-[#111111]',
    outline:
      'border-2 border-[#D1D5DB] text-[#1A1A1A] bg-white hover:bg-[#F8F9FA] active:bg-[#E5E7EB] focus-visible:ring-[#04805B]',
    ghost:
      'text-[#4B5563] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] focus-visible:ring-[#04805B]',
    danger:
      'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm hover:shadow-md focus-visible:ring-[#F87171]',
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
