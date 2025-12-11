import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, FileJson, FileSpreadsheet, Check } from 'lucide-react';
import Button from './ui/Button';
import { exportTransactions, ExportFormat, generateAnalyticsSummary } from '../utils/exportUtils';
import { Transaction } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    {
      value: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Comma-separated values for Excel',
      icon: FileSpreadsheet,
    },
    {
      value: 'json' as ExportFormat,
      label: 'JSON',
      description: 'Structured data format',
      icon: FileJson,
    },
    {
      value: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Printable document',
      icon: FileText,
    },
  ];

  const analytics = generateAnalyticsSummary(transactions);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTransactions(transactions, {
        format: selectedFormat,
      });
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Export Transactions</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Download {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.value;
                  
                  return (
                    <button
                      key={format.value}
                      onClick={() => setSelectedFormat(format.value)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                          : 'border-[var(--border-default)] hover:border-[var(--border-medium)]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-0.5 bg-[var(--color-primary)] rounded-full">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <Icon className={`h-6 w-6 ${
                        isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'
                      }`} />
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {format.label}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {format.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analytics summary */}
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Export Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Total Transactions</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {analytics.totalTransactions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Total Amount</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    ₵{analytics.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Average Amount</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    ₵{analytics.averageAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Date Range</p>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {analytics.dateRange.earliest
                      ? `${analytics.dateRange.earliest.toLocaleDateString()} - ${analytics.dateRange.latest?.toLocaleDateString()}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnalytics}
                  onChange={(e) => setIncludeAnalytics(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-primary)] border-[var(--border-default)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">
                  Include analytics summary
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)] bg-[var(--bg-tertiary)]/50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={isExporting || transactions.length === 0}
              leftIcon={isExporting ? undefined : <Download className="h-4 w-4" />}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;

