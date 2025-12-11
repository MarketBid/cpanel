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
    default: 'bg-[rgba(4,128,91,0.14)] text-[#024B35]',
    success: 'bg-[rgba(16,185,129,0.12)] text-[#0F9B73]',
    warning: 'bg-[rgba(245,158,11,0.12)] text-[#B7791F]',
    error: 'bg-[rgba(239,68,68,0.12)] text-[#B91C1C]',
    info: 'bg-[rgba(59,130,246,0.12)] text-[#1D4ED8]',
    neutral: 'bg-[#F3F4F6] text-[#4B5563]',
  };

  const dotStyles = {
    default: 'bg-[#04805B]',
    success: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    info: 'bg-[#3B82F6]',
    neutral: 'bg-[#6B7280]',
  };

  return (
    <span className={`badge ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} mr-1.5`} />}
      {children}
    </span>
  );
};

export default Badge;
