import { Transaction } from '../types';

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Export transactions to CSV format
 */
export const exportToCSV = (transactions: Transaction[], filename = 'transactions.csv') => {
  const headers = [
    'Transaction ID',
    'Title',
    'Description',
    'Amount',
    'Status',
    'Sender ID',
    'Receiver ID',
    'Created At',
    'Updated At',
  ];

  const rows = transactions.map(t => [
    t.transaction_id,
    t.title || '',
    t.description || '',
    t.amount,
    t.status,
    t.sender_id,
    t.receiver_id,
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
  const jsonContent = JSON.stringify(transactions, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

/**
 * Export transactions to PDF format (simplified version)
 */
export const exportToPDF = async (transactions: Transaction[], filename = 'transactions.pdf') => {
  // This is a simplified version. For production, consider using jsPDF or similar
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transactions Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #0F9D7E; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #0F9D7E; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { margin-bottom: 30px; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Clarsix Transactions Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Transactions: ${transactions.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td>${t.transaction_id}</td>
              <td>${t.title || 'N/A'}</td>
              <td>₵${t.amount}</td>
              <td>${t.status}</td>
              <td>${new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Clarsix Transaction Platform - Secure Escrow-grade Protection</p>
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

