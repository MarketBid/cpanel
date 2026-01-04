import { Eye, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionStatus } from '../types';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { getTransactionTypeStyles } from '../utils/statusUtils';

interface TransactionCardProps {
  transaction: Transaction;
  isSender: boolean;
}

export const TransactionCard = ({ transaction, isSender }: TransactionCardProps) => {
  const navigate = useNavigate();
  const { maskAmount } = useSensitiveInfo();

  const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
    [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-[#0F9B73]', bg: 'bg-[rgba(16,185,129,0.12)]' },
    [TransactionStatus.PAID]: { label: 'Paid', color: 'text-[#0F9B73]', bg: 'bg-[rgba(16,185,129,0.12)]' },
    [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-[#1D4ED8]', bg: 'bg-[rgba(59,130,246,0.12)]' },
    [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-[#0F9B73]', bg: 'bg-[rgba(16,185,129,0.12)]' },
    [TransactionStatus.ACK_DELIVERY]: { label: 'Delivery Acknowledged', color: 'text-[#1D4ED8]', bg: 'bg-[rgba(59,130,246,0.12)]' },
    [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-[#B7791F]', bg: 'bg-[rgba(245,158,11,0.12)]' },
    [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-[#B91C1C]', bg: 'bg-[rgba(239,68,68,0.12)]' },
    [TransactionStatus.DISPUTE_RESOLVED]: { label: 'Dispute Resolved', color: 'text-[#0F9B73]', bg: 'bg-[rgba(16,185,129,0.12)]' },
    [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-[#4B5563]', bg: 'bg-[#F3F4F6]' },
  };

  // Provide a fallback config if status is not found
  const status = statusConfig[transaction.status as TransactionStatus] || {
    label: String(transaction.status || 'Unknown').replace('_', ' '),
    color: 'text-neutral-700',
    bg: 'bg-neutral-50'
  };

  return (
    <div className="card card-hover p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-11 w-11 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-[var(--text-secondary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{transaction.title}</p>
              {(() => {
                const typeStyles = getTransactionTypeStyles(transaction.type);
                return (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                    {typeStyles.shortLabel}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">{transaction.description?.slice(0, 30)}...</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.color} whitespace-nowrap ml-2`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-0.5">Amount</p>
          <p className={`text-sm font-semibold ${isSender ? 'text-[#B91C1C]' : 'text-[#0F9B73]'}`}>
            {isSender ? '-' : '+'}₵{maskAmount(transaction.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)] mb-0.5">Date</p>
          <p className="text-xs text-[var(--text-primary)]">
            {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } })}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </div>
    </div>
  );
};

// Alias export for transaction-based naming

