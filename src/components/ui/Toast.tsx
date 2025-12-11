import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconBgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
      <div className="bg-[#111827] text-white px-4 py-3 rounded-xl shadow-[0_14px_36px_rgba(0,0,0,0.25)] border border-white/5 flex items-center gap-3 min-w-[280px]">
        <div className={`p-1.5 ${iconBgColor} rounded-full shadow-inner`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-800 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
