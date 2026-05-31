import type { ParsedTransaction } from '../hooks/useTransactionHistory'

export function exportToCSV(transactions: ParsedTransaction[]): void {
  const headers = ['Date', 'Time', 'Chain', 'Type', 'Amount', 'Token', 'Status', 'Tx Hash', 'From', 'To', 'Fee', 'Source']
  const rows = transactions.map((tx) => [
    new Date(tx.timestamp).toLocaleDateString(),
    new Date(tx.timestamp).toLocaleTimeString(),
    tx.chain,
    tx.type,
    String(tx.amount),
    tx.token,
    tx.status,
    tx.txId || tx.signature || '',
    tx.from,
    tx.to,
    String(tx.fee || 0),
    tx.source,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(','))].join('
')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'artemisx-transactions-' + new Date().toISOString().split('T')[0] + '.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
