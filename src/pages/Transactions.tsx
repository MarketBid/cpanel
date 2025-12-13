import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Package,
  Eye,
  Copy,
  Download,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import Toast from '../components/ui/Toast';
import { TransactionCard } from '../components/TransactionCard';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';
import { useTransactions, transactionKeys } from '../hooks/queries/useTransactions';
import { useQueryClient } from '@tanstack/react-query';
import ExportModal from '../components/ExportModal';

type SortField = 'date' | 'status' | 'amount';
type SortTransaction = 'asc' | 'desc';

const Transactions: React.FC = () => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<TransactionStatus[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortTransaction, setSortTransaction] = useState<SortTransaction>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const transactionsPerPage = 15;
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { maskAmount } = useSensitiveInfo();
  const queryClient = useQueryClient();

  // Use React Query to fetch transactions with caching
  const { data: transactions = [], isLoading: loading } = useTransactions();

  // SSE connection for real-time updates
  const handleStatusChange = useCallback((event: TransactionEvent) => {
    if (event.type === 'status_changed' && event.transactionId && event.status) {
      // Update the transaction in React Query cache
      queryClient.setQueryData<Transaction[]>(transactionKeys.lists(), (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((transaction) => {
          if (transaction.transaction_id === event.transactionId) {
            const updatedTransaction = {
              ...transaction,
              status: event.status as TransactionStatus,
              updated_at: event.timestamp || new Date().toISOString(),
            };

            // Show notification
            const statusLabels: Record<string, string> = {
              pending: 'Pending',
              paid: 'Paid',
              intransit: 'In Transit',
              delivered: 'Delivered',
              completed: 'Completed',
              cancelled: 'Cancelled',
              disputed: 'Disputed',
            };

            const statusLabel = statusLabels[event.status as string] || event.status;
            setToastMessage(`Transaction ${transaction.transaction_id} status changed to ${statusLabel}`);
            setShowToast(true);

            return updatedTransaction;
          }
          return transaction;
        });
      });

      // Also update the individual transaction cache if it exists
      queryClient.setQueryData<Transaction>(transactionKeys.detail(event.transactionId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          status: event.status as TransactionStatus,
          updated_at: event.timestamp || new Date().toISOString(),
        };
      });

      // Invalidate to ensure fresh data on next access
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(event.transactionId) });
    } else if (event.type === 'transaction_updated' && event.transactionId) {
      // Invalidate the specific transaction to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(event.transactionId) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    }
  }, [queryClient]);

  useTransactionEvents({
    enabled: isAuthenticated,
    onStatusChange: handleStatusChange,
  });

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const stateFilter = location.state?.filterStatus;

    if (stateFilter && Object.values(TransactionStatus).includes(stateFilter as TransactionStatus)) {
      setStatusFilters([stateFilter as TransactionStatus]);
    } else if (statusFromUrl && Object.values(TransactionStatus).includes(statusFromUrl as TransactionStatus)) {
      setStatusFilters([statusFromUrl as TransactionStatus]);
    }
  }, [searchParams, location.state]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, statusFilters, dateFrom, dateTo, sortField, sortTransaction]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, statusFilters, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const filterAndSortTransactions = () => {
    let filtered = transactions;
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payment_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilters.length > 0) {
      filtered = filtered.filter(transaction => statusFilters.includes(transaction.status));
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(transaction => new Date(transaction.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(transaction => new Date(transaction.created_at) <= toDate);
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'status') {
        const statusTransaction = {
          [TransactionStatus.PENDING]: 1,
          [TransactionStatus.PAID]: 2,
          [TransactionStatus.IN_TRANSIT]: 3,
          [TransactionStatus.DELIVERED]: 4,
          [TransactionStatus.COMPLETED]: 5,
          [TransactionStatus.DISPUTED]: 6,
          [TransactionStatus.CANCELLED]: 7,
        };
        comparison = statusTransaction[a.status] - statusTransaction[b.status];
      }

      return sortTransaction === 'asc' ? comparison : -comparison;
    });

    setFilteredTransactions(sorted);
  };

  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleStatusFilter = (status: TransactionStatus) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearStatusFilters = () => {
    setStatusFilters([]);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      setSortTransaction(sortTransaction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortTransaction('desc');
    }
  };

  const hasActiveDateFilter = dateFrom || dateTo;

  const allStatuses = Object.values(TransactionStatus);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusColor = (status: TransactionStatus) => {
    const colors: Record<TransactionStatus, { bg: string; text: string; btransaction: string }> = {
      [TransactionStatus.PENDING]: { bg: 'bg-[var(--status-pending-bg)]', text: 'text-[var(--status-pending-text)]', btransaction: 'border-[var(--status-pending-border)]' },
      [TransactionStatus.PAID]: { bg: 'bg-[var(--status-paid-bg)]', text: 'text-[var(--status-paid-text)]', btransaction: 'border-[var(--status-paid-border)]' },
      [TransactionStatus.IN_TRANSIT]: { bg: 'bg-[var(--status-inTransit-bg)]', text: 'text-[var(--status-inTransit-text)]', btransaction: 'border-[var(--status-inTransit-border)]' },
      [TransactionStatus.DELIVERED]: { bg: 'bg-[var(--status-delivered-bg)]', text: 'text-[var(--status-delivered-text)]', btransaction: 'border-[var(--status-delivered-border)]' },
      [TransactionStatus.COMPLETED]: { bg: 'bg-[var(--status-completed-bg)]', text: 'text-[var(--status-completed-text)]', btransaction: 'border-[var(--status-completed-border)]' },
      [TransactionStatus.DISPUTED]: { bg: 'bg-[var(--status-disputed-bg)]', text: 'text-[var(--status-disputed-text)]', btransaction: 'border-[var(--status-disputed-border)]' },
      [TransactionStatus.CANCELLED]: { bg: 'bg-[var(--status-cancelled-bg)]', text: 'text-[var(--status-cancelled-text)]', btransaction: 'border-[var(--status-cancelled-border)]' },
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">My Transactions</h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Manage and track all your transactions
            </p>
          </div>

        </div>
        <button
          onClick={() => navigate('/transactions/create')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-text)] text-xs sm:text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Transaction
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]">
        <div className="p-4 sm:p-5 border-b border-[var(--border-default)]">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-[var(--border-default)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1" ref={dateDropdownRef}>
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg transition-colors w-full ${hasActiveDateFilter
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                    : 'text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                >
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Date Filter</span>
                  {hasActiveDateFilter && <span className="ml-1 px-1.5 py-0.5 bg-[var(--color-primary-text)]/20 rounded text-[10px]">✓</span>}
                </button>
                {showDateDropdown && (
                  <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-80 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-[var(--text-primary)]">Filter by Date</span>
                      {hasActiveDateFilter && (
                        <button
                          onClick={clearDateFilter}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                          From Date <span className="hidden sm:inline text-[var(--text-tertiary)]">(DD/MM/YYYY)</span>
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          max={dateTo || undefined}
                          placeholder="dd/mm/yyyy"
                          className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] placeholder:lowercase bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                          To Date <span className="hidden sm:inline text-[var(--text-tertiary)]">(DD/MM/YYYY)</span>
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom || undefined}
                          placeholder="dd/mm/yyyy"
                          className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] placeholder:lowercase bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                      </div>
                      {hasActiveDateFilter && (
                        <div className="pt-2 border-t border-[var(--border-default)]">
                          <div className="text-xs text-[var(--text-secondary)]">
                            Showing transactions from{' '}
                            <span className="font-medium text-[var(--text-primary)]">
                              {dateFrom ? new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'beginning'}
                            </span>
                            {' '}to{' '}
                            <span className="font-medium text-[var(--text-primary)]">
                              {dateTo ? new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'today'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative flex-1" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg transition-colors w-full ${statusFilters.length > 0
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                    : 'text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                >
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Status Filter</span>
                  {statusFilters.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[var(--color-primary-text)]/20 rounded text-[10px]">{statusFilters.length}</span>}
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-72 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[var(--text-primary)]">Filter by Status</span>
                      {statusFilters.length > 0 && (
                        <button
                          onClick={clearStatusFilters}
                          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {allStatuses.map(status => {
                        const colors = getStatusColor(status);
                        const isChecked = statusFilters.includes(status);
                        return (
                          <label
                            key={status}
                            className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 transition-colors border ${isChecked
                              ? `${colors.bg} ${colors.border}`
                              : 'border-transparent hover:bg-[var(--bg-tertiary)]'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStatusFilter(status)}
                              className="w-4 h-4 text-[var(--color-primary)] border-[var(--border-medium)] rounded focus:ring-[var(--color-primary)]"
                            />
                            <span className={`text-sm font-medium capitalize ${isChecked ? colors.text : 'text-[var(--text-primary)]'}`}>
                              {status.replace('_', ' ')}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-tertiary)] hover:border-[var(--color-primary)] transition-colors flex-1"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((transaction) => {
              const isSender = transaction.sender_id === user?.id;
              return (
                <TransactionCard key={transaction.id} transaction={transaction} isSender={isSender} />
              );
            })
          ) : (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-[var(--text-tertiary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                {searchTerm || statusFilters.length > 0 || hasActiveDateFilter ? 'No transactions found' : 'No transactions yet'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {searchTerm || statusFilters.length > 0 || hasActiveDateFilter
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first transaction'}
              </p>
              {!searchTerm && statusFilters.length === 0 && !hasActiveDateFilter && (
                <button
                  onClick={() => navigate('/transactions/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-text)] text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Transaction
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Transaction</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Join Link</th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('amount')}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>Amount</span>
                    {sortField === 'amount' ? (
                      sortTransaction === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('date')}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>Date</span>
                    {sortField === 'date' ? (
                      sortTransaction === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('status')}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortTransaction === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => {
                  const isSender = transaction.sender_id === user?.id;
                  const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
                    [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-[var(--status-completed-text)]', bg: 'bg-[var(--status-completed-bg)]' },
                    [TransactionStatus.PAID]: { label: 'Paid', color: 'text-[var(--status-paid-text)]', bg: 'bg-[var(--status-paid-bg)]' },
                    [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-[var(--status-inTransit-text)]', bg: 'bg-[var(--status-inTransit-bg)]' },
                    [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-[var(--status-delivered-text)]', bg: 'bg-[var(--status-delivered-bg)]' },
                    [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-[var(--status-pending-text)]', bg: 'bg-[var(--status-pending-bg)]' },
                    [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-[var(--status-disputed-text)]', bg: 'bg-[var(--status-disputed-bg)]' },
                    [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-[var(--status-cancelled-text)]', bg: 'bg-[var(--status-cancelled-bg)]' },
                  };

                  // Provide a fallback config if status is not found, and log for debugging
                  const status = statusConfig[transaction.status as TransactionStatus] || {
                    label: String(transaction.status || 'Unknown').replace('_', ' '),
                    color: 'text-neutral-700',
                    bg: 'bg-neutral-50'
                  };

                  return (
                    <tr key={transaction.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">{transaction.title}</p>
                            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] truncate">{transaction.description?.slice(0, 20)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/transactions/join/${transaction.transaction_id}`}
                            className="text-xs sm:text-sm font-mono text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors"
                          >
                            {transaction.transaction_id}
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const joinUrl = `${window.location.origin}/transactions/join/${transaction.transaction_id}`;
                              copyToClipboard(joinUrl, e);
                            }}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                            title="Copy join link"
                          >
                            <Copy className="h-3 w-3 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs sm:text-sm font-medium ${isSender ? 'text-[var(--amount-negative)]' : 'text-[var(--amount-positive)]'}`}>
                          {isSender ? '-' : '+'}₵{maskAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs sm:text-sm text-[var(--text-primary)]">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium ${status.bg} ${status.color}`}>
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${status.color.replace('text-', 'bg-')} mr-1 sm:mr-1.5`} />
                          <span className="hidden sm:inline">{status.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } })}
                          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-[var(--text-tertiary)]" />
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                        {searchTerm || statusFilters.length > 0 || hasActiveDateFilter ? 'No transactions found' : 'No transactions yet'}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        {searchTerm || statusFilters.length > 0 || hasActiveDateFilter
                          ? 'Try adjusting your filters or search terms'
                          : 'Get started by creating your first transaction'}
                      </p>
                      {!searchTerm && statusFilters.length === 0 && !hasActiveDateFilter && (
                        <button
                          onClick={() => navigate('/transactions/create')}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-text)] text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create Transaction
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="px-5 py-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${currentPage === page
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <Toast
          message={toastMessage || "Copied to clipboard!"}
          onClose={() => {
            setShowToast(false);
            setToastMessage('');
          }}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={filteredTransactions}
      />
    </div>
  );
};

export default Transactions;
