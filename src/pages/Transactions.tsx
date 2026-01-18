import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Copy,
  Download,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  FileText,
  MoreVertical
} from 'lucide-react';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import Toast from '../components/ui/Toast';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';
import { useTransactions, transactionKeys } from '../hooks/queries/useTransactions';
import { useQueryClient } from '@tanstack/react-query';
import ExportModal from '../components/ExportModal';
import { getTransactionTypeStyles } from '../utils/statusUtils';

type SortField = 'date' | 'status' | 'amount' | 'type';
type SortTransaction = 'asc' | 'desc';

const Transactions: React.FC = () => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<TransactionStatus[]>([]);
  const [typeFilters, setTypeFilters] = useState<TransactionType[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortTransaction, setSortTransaction] = useState<SortTransaction>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const transactionsPerPage = 15;
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
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
  }, [transactions, searchTerm, statusFilters, typeFilters, dateFrom, dateTo, sortField, sortTransaction]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, statusFilters, typeFilters, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
      // Close action menu when clicking outside
      const target = event.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenActionMenu(null);
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
    if (typeFilters.length > 0) {
      filtered = filtered.filter(transaction => typeFilters.includes(transaction.type));
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
          [TransactionStatus.ACK_DELIVERY]: 5,
          [TransactionStatus.COMPLETED]: 6,
          [TransactionStatus.DISPUTED]: 7,
          [TransactionStatus.DISPUTE_RESOLVED]: 8,
          [TransactionStatus.CANCELLED]: 9,
        };
        comparison = statusTransaction[a.status] - statusTransaction[b.status];
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
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

  const toggleTypeFilter = (type: TransactionType) => {
    setTypeFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearTypeFilters = () => {
    setTypeFilters([]);
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
  const allTypes = Object.values(TransactionType);

  const statusColors: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: '#b45309', // amber-700
    [TransactionStatus.PAID]: '#1d4ed8', // blue-700
    [TransactionStatus.IN_TRANSIT]: '#4338ca', // indigo-700
    [TransactionStatus.DELIVERED]: '#7e22ce', // purple-700
    [TransactionStatus.ACK_DELIVERY]: '#4338ca', // indigo-700
    [TransactionStatus.COMPLETED]: '#047857', // emerald-700
    [TransactionStatus.DISPUTED]: '#b91c1c', // red-700
    [TransactionStatus.DISPUTE_RESOLVED]: '#047857', // emerald-700
    [TransactionStatus.CANCELLED]: '#374151', // gray-700
  };

  const typeColors: Record<TransactionType, string> = {
    [TransactionType.PHYSICAL_GOODS]: '#2563eb', // blue-600
    [TransactionType.DIGITAL_GOODS]: '#9333ea', // purple-600
    [TransactionType.SERVICE]: '#d97706', // amber-600
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 pt-6">
      <div className="flex-none space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Manage and track all your payments and transactions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--text-primary)] transition-all"
              />
            </div>

            <div className="relative group">
              <button
                onClick={() => user?.verified ? navigate('/transactions/create') : null}
                disabled={!user?.verified}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto whitespace-nowrap ${user?.verified
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Plus className="h-4 w-4" />
                New Transaction
              </button>
              {!user?.verified && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 shadow-lg">
                  Please verify your account in Settings to create transactions
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Filter (All) */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[100px] justify-between"
              >
                <span>{statusFilters.length > 0 ? `${statusFilters.length} Selected` : 'All'}</span>
                <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</span>
                    {statusFilters.length > 0 && (
                      <button
                        onClick={clearStatusFilters}
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {allStatuses.map(status => {
                      const isChecked = statusFilters.includes(status);
                      return (
                        <label
                          key={status}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStatusFilter(status)}
                            className="w-3.5 h-3.5 rounded border-[var(--border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusColors[status] }}
                          />
                          <span className="text-sm text-[var(--text-primary)] capitalize">
                            {status.replace('_', ' ').toLowerCase()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[100px] justify-between"
              >
                <span>{typeFilters.length > 0 ? `${typeFilters.length} Types` : 'All Types'}</span>
                <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Type</span>
                    {typeFilters.length > 0 && (
                      <button
                        onClick={clearTypeFilters}
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {allTypes.map(type => {
                      const isChecked = typeFilters.includes(type);
                      return (
                        <label
                          key={type}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTypeFilter(type)}
                            className="w-3.5 h-3.5 rounded border-[var(--border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: typeColors[type] }}
                          />
                          <span className="text-sm text-[var(--text-primary)] capitalize">
                            {type.replace('_', ' ').toLowerCase()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className={`flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border rounded-lg text-sm font-medium transition-colors ${hasActiveDateFilter
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
              </button>
              {showDateDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-4">
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          max={dateTo || undefined}
                          className="w-full px-2 py-1.5 text-sm border border-[var(--border-default)] rounded-md focus:border-[var(--color-primary)] focus:outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">To</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom || undefined}
                          className="w-full px-2 py-1.5 text-sm border border-[var(--border-default)] rounded-md focus:border-[var(--color-primary)] focus:outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden shadow-sm flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block flex-1 overflow-auto">
          <table className="w-full relative">
            <thead className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border-default)] shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <button onClick={() => handleColumnSort('date')} className="flex items-center gap-1 hover:text-[var(--text-primary)]">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <button onClick={() => handleColumnSort('amount')} className="flex items-center gap-1 hover:text-[var(--text-primary)]">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <button onClick={() => handleColumnSort('type')} className="flex items-center gap-1 hover:text-[var(--text-primary)]">
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <button onClick={() => handleColumnSort('status')} className="flex items-center gap-1 hover:text-[var(--text-primary)]">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => {
                  const isSender = transaction.sender_id === user?.id;
                  const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
                    [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    [TransactionStatus.PAID]: { label: 'Paid', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    [TransactionStatus.ACK_DELIVERY]: { label: 'Acknowledged', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    [TransactionStatus.DISPUTE_RESOLVED]: { label: 'Resolved', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
                  };

                  const status = statusConfig[transaction.status as TransactionStatus] || {
                    label: String(transaction.status || 'Unknown').replace('_', ' '),
                    color: 'text-neutral-700',
                    bg: 'bg-neutral-50'
                  };

                  return (
                    <tr
                      key={transaction.id}
                      className="group hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 border border-[var(--border-default)]">
                            <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{transaction.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-[var(--text-secondary)] font-mono">{transaction.transaction_id}</p>
                              <button
                                onClick={(e) => copyToClipboard(transaction.transaction_id, e)}
                                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded hover:bg-[var(--bg-tertiary)]"
                                title="Copy ID"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-primary)]">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${isSender ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                          ₵{maskAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const typeStyles = getTransactionTypeStyles(transaction.type);
                          return (
                            <span className={`text-xs font-bold px-2 py-1 rounded border uppercase ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                              {typeStyles.shortLabel}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} border-transparent`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end" data-action-menu>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(openActionMenu === transaction.transaction_id ? null : transaction.transaction_id);
                              }}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openActionMenu === transaction.transaction_id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 py-1">
                                {transaction.payment_link && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(transaction.payment_link!, e);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                                  >
                                    <Copy className="h-4 w-4 text-[var(--text-secondary)]" />
                                    Copy Payment Link
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } });
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                                >
                                  <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-[var(--text-tertiary)]" />
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                        No transactions found
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                        We couldn't find any transactions matching your search filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex-1 overflow-y-auto divide-y divide-[var(--border-default)]">
          {paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((transaction) => {
              const isSender = transaction.sender_id === user?.id;
              return (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-[var(--bg-tertiary)]/50 transition-colors active:bg-[var(--bg-tertiary)]"
                  onClick={() => navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction } })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 border border-[var(--border-default)]">
                        <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{transaction.title}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-[var(--text-secondary)] font-mono">{transaction.transaction_id}</p>
                          <button
                            onClick={(e) => copyToClipboard(transaction.transaction_id, e)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded hover:bg-[var(--bg-tertiary)]"
                            title="Copy ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${isSender ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                      ₵{maskAmount(transaction.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
                          [TransactionStatus.COMPLETED]: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          [TransactionStatus.PAID]: { label: 'Paid', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                          [TransactionStatus.IN_TRANSIT]: { label: 'In Transit', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                          [TransactionStatus.DELIVERED]: { label: 'Delivered', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                          [TransactionStatus.ACK_DELIVERY]: { label: 'Acknowledged', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                          [TransactionStatus.PENDING]: { label: 'Pending', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                          [TransactionStatus.DISPUTED]: { label: 'Disputed', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                          [TransactionStatus.DISPUTE_RESOLVED]: { label: 'Resolved', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          [TransactionStatus.CANCELLED]: { label: 'Cancelled', color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
                        };

                        const status = statusConfig[transaction.status as TransactionStatus] || {
                          label: String(transaction.status || 'Unknown').replace('_', ' '),
                          color: 'text-neutral-700',
                          bg: 'bg-neutral-50'
                        };

                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color} border-transparent`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No transactions found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex-none px-6 py-4 border-t border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-card)]">
            <div className="text-sm text-[var(--text-secondary)]">
              Showing <span className="font-medium text-[var(--text-primary)]">{startIndex + 1}</span> to <span className="font-medium text-[var(--text-primary)]">{Math.min(endIndex, filteredTransactions.length)}</span> of <span className="font-medium text-[var(--text-primary)]">{filteredTransactions.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
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
