import { Transaction } from '../stores/bumpStore';
import { ParsedTransaction } from './api';

export interface ExportRow {
  Date: string;
  Time: string;
  Chain: string;
  Type: string;
  Amount: string;
  Token: string;
  Status: string;
  'Tx Hash': string;
  From: string;
  To: string;
  Fee: string;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('
')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(timestamp: number): { date: string; time: string } {
  const d = new Date(timestamp);
  return {
    date: d.toISOString().split('T')[0],
    time: d.toTimeString().split(' ')[0],
  };
}

export function transactionsToCSV(
  bumpTxs: Transaction[],
  heliusTxs: ParsedTransaction[] = []
): string {
  const rows: ExportRow[] = [];

  // Bump transactions
  bumpTxs.forEach((tx) => {
    const { date, time } = formatDate(tx.timestamp);
    rows.push({
      Date: date,
      Time: time,
      Chain: tx.chain,
      Type: 'bump',
      Amount: String(tx.amount),
      Token: tx.chain.toUpperCase(),
      Status: tx.status,
      'Tx Hash': tx.txId || 'N/A',
      From: tx.from,
      To: tx.to,
      Fee: '0',
    });
  });

  // Helius transactions
  heliusTxs.forEach((tx) => {
    const { date, time } = formatDate(tx.timestamp);
    rows.push({
      Date: date,
      Time: time,
      Chain: tx.token === 'ETH' || tx.token === 'BNB' ? tx.token.toLowerCase() : 'solana',
      Type: tx.type,
      Amount: tx.amount > 0 ? String(tx.amount) : 'N/A',
      Token: tx.token,
      Status: tx.status,
      'Tx Hash': tx.signature,
      From: tx.from,
      To: tx.to,
      Fee: String(tx.fee),
    });
  });

  // Sort by date descending
  rows.sort((a, b) => {
    const aDate = new Date(`${a.Date}T${a.Time}`).getTime();
    const bDate = new Date(`${b.Date}T${b.Time}`).getTime();
    return bDate - aDate;
  });

  // Headers
  const headers = Object.keys(rows[0] || {}).map(escapeCSV).join(',');

  // Rows
  const csvRows = rows.map((row) =>
    Object.values(row).map(String).map(escapeCSV).join(',')
  );

  return [headers, ...csvRows].join('
');
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
