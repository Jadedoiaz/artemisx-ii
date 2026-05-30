import { useBumpStore } from '../stores/bumpStore';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { formatTime, shortenTx } from '../lib/utils';
import { openExternal } from '../lib/tauri';

const statusIcons = {
  success: <CheckCircle size={16} className="text-success" />,
  failed: <XCircle size={16} className="text-danger" />,
  pending: <Clock size={16} className="text-warning" />,
};

export default function Activity() {
  const transactions = useBumpStore((s) => s.transactions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted mt-1">Transaction history and logs</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-sm text-muted border-b border-border bg-surface-highlight">
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Chain</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No transactions yet. Start bumping to see activity here.
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-surface-highlight/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {statusIcons[tx.status]}
                      <span className="text-sm capitalize">{tx.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{tx.chain}</td>
                  <td className="px-6 py-4 font-mono text-sm">{tx.amount}</td>
                  <td className="px-6 py-4 font-mono text-sm">
                    {tx.txId ? shortenTx(tx.txId) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {formatTime(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    {tx.txId && (
                      <button
                        onClick={() => openExternal(`https://solscan.io/tx/${tx.txId}`)}
                        className="text-accent hover:text-accent-hover"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
