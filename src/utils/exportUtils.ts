import { Transaction } from '../types';

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Standardize transaction data for consistent export across all formats
 */
interface StandardizedTransaction {
  transaction_id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  sender_id: number;
  receiver_id: number | null;
  payment_code: string;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  receiver_name?: string;
}

/**
 * Convert transactions to standardized format
 */
const standardizeTransactions = (transactions: Transaction[]): StandardizedTransaction[] => {
  return transactions.map(t => ({
    transaction_id: t.transaction_id,
    title: t.title || '',
    description: t.description || '',
    amount: t.amount,
    status: t.status,
    sender_id: t.sender_id,
    receiver_id: t.receiver_id || null,
    payment_code: t.payment_code,
    created_at: t.created_at,
    updated_at: t.updated_at,
    sender_name: t.sender?.name || '',
    receiver_name: t.receiver?.name || '',
  }));
};

/**
 * Export transactions to CSV format
 */
export const exportToCSV = (transactions: Transaction[], filename = 'transactions.csv') => {
  const standardized = standardizeTransactions(transactions);
  
  const headers = [
    'Transaction ID',
    'Title',
    'Description',
    'Amount',
    'Status',
    'Sender ID',
    'Sender Name',
    'Receiver ID',
    'Receiver Name',
    'Payment Code',
    'Created At',
    'Updated At',
  ];

  const rows = standardized.map(t => [
    t.transaction_id,
    t.title,
    t.description,
    t.amount,
    t.status,
    t.sender_id,
    t.sender_name || '',
    t.receiver_id || '',
    t.receiver_name || '',
    t.payment_code,
    new Date(t.created_at).toLocaleString(),
    new Date(t.updated_at).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

/**
 * Export transactions to JSON format
 */
export const exportToJSON = (transactions: Transaction[], filename = 'transactions.json') => {
  const standardized = standardizeTransactions(transactions);
  const jsonContent = JSON.stringify(standardized, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

/**
 * Export transactions to PDF format (HTML format for printing)
 */
export const exportToPDF = async (transactions: Transaction[], filename = 'transactions.pdf') => {
  const standardized = standardizeTransactions(transactions);
  
  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transactions Report</title>
      <style>
        @media print {
          @page { margin: 1cm; }
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          padding: 20px; 
          color: #1F2937;
          background: white;
        }
        .header { 
          margin-bottom: 30px; 
          border-bottom: 2px solid #0F9D7E;
          padding-bottom: 20px;
        }
        h1 { 
          color: #0F9D7E; 
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .header-info {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #6B7280;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px; 
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #E5E7EB; 
          padding: 10px 8px; 
          text-align: left; 
        }
        th { 
          background-color: #0F9D7E; 
          color: white; 
          font-weight: 600;
          position: sticky;
          top: 0;
        }
        tr:nth-child(even) { 
          background-color: #F9FAFB; 
        }
        tr:hover {
          background-color: #F3F4F6;
        }
        .amount {
          font-weight: 600;
          color: #059669;
        }
        .status {
          text-transform: capitalize;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #6B7280;
          font-size: 12px;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
        }
        .description-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Clarsix Transactions Report</h1>
        <div class="header-info">
          <div><strong>Generated on:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>Total Transactions:</strong> ${transactions.length}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Sender ID</th>
            <th>Sender Name</th>
            <th>Receiver ID</th>
            <th>Receiver Name</th>
            <th>Payment Code</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          ${standardized.map(t => `
            <tr>
              <td>${escapeHtml(t.transaction_id)}</td>
              <td>${escapeHtml(t.title)}</td>
              <td class="description-cell" title="${escapeHtml(t.description)}">${escapeHtml(t.description)}</td>
              <td class="amount">₵${t.amount.toLocaleString()}</td>
              <td><span class="status">${escapeHtml(t.status.replace('_', ' '))}</span></td>
              <td>${t.sender_id}</td>
              <td>${escapeHtml(t.sender_name || 'N/A')}</td>
              <td>${t.receiver_id || 'N/A'}</td>
              <td>${escapeHtml(t.receiver_name || 'N/A')}</td>
              <td>${escapeHtml(t.payment_code)}</td>
              <td>${new Date(t.created_at).toLocaleString()}</td>
              <td>${new Date(t.updated_at).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Clarsix Transaction Platform - Secure Escrow-grade Protection</p>
        <p>This report contains ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace('.pdf', '.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to download a file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main export function that handles all formats
 */
export const exportTransactions = async (
  transactions: Transaction[],
  options: ExportOptions
) => {
  const { format, filename } = options;
  const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'csv':
      exportToCSV(transactions, filename || `${defaultFilename}.csv`);
      break;
    case 'json':
      exportToJSON(transactions, filename || `${defaultFilename}.json`);
      break;
    case 'pdf':
      await exportToPDF(transactions, filename || `${defaultFilename}.pdf`);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Generate analytics summary for export
 */
export const generateAnalyticsSummary = (transactions: Transaction[]) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const statusCounts = transactions.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;

  return {
    totalTransactions: transactions.length,
    totalAmount,
    averageAmount: avgAmount,
    statusBreakdown: statusCounts,
    dateRange: {
      earliest: transactions.length > 0 
        ? new Date(Math.min(...transactions.map(t => new Date(t.created_at).getTime())))
        : null,
      latest: transactions.length > 0
        ? new Date(Math.max(...transactions.map(t => new Date(t.created_at).getTime())))
        : null,
    },
  };
};

