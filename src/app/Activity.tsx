import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { useBumpStore } from '../stores/bumpStore';
import { CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, Wallet, Filter } from 'lucide-react';
import { formatTime, shortenTx } from '../lib/utils';
import { openExternal } from '../lib/tauri';
import { cn } from '../lib/utils';
import { ParsedTransaction } from '../lib/api';

const statusIcons = {
  success: <CheckCircle size={16} className="text-success" />,
  failed: <XCircle size={16} className="text-danger" />,
  pending: <Clock size={16} className="text-warning" />,
};

const typeLabels: Record<string, { label: string; color: string }> = {
  transfer: { label: 'Transfer', color: 'text-accent' },
  swap: { label: 'Swap', color: 'text-warning' },
  nft: { label: 'NFT', color: 'text-purple-400' },
  stake: { label: 'Stake', color: 'text-success' },
  bump: { label: 'Bump', color: 'text-accent' },
  unknown: { label: 'TX', color: 'text-muted' },
};

interface ActivityTransaction extends ParsedTransaction {
  source?: 'bump' | 'helius';
}

export default function Activity() {
  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const { transactions: heliusTxs, loading, error, refetch } = useTransactionHistory();
  const bumpTxs = useBumpStore((s: { transactions: Array<{ id: string; chain: string; type: string; amount: number; status: 'pending' | 'success' | 'failed'; txId?: string; timestamp: number; from: string; to: string }> }) => s.transactions);
  const [filter, setFilter] = useState<string>('all');

  const anyConnected = solanaConnected || evmConnected;

  // Merge bump transactions with Helius history
  const allTransactions: ActivityTransaction[] = [
    ...bumpTxs.map(tx => ({
      signature: tx.txId || tx.id,
      timestamp: tx.timestamp,
      type: 'bump' as ParsedTransaction['type'],
      description: `Bump ${tx.amount} ${tx.chain}`,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      token: tx.chain.toUpperCase(),
      fee: 0,
      status: tx.status as ParsedTransaction['status'],
      source: 'bump' as const,
    })),
    ...heliusTxs.map(tx => ({ ...tx, source: 'helius' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filtered = filter === 'all' 
    ? allTransactions 
    : allTransactions.filter(tx => tx.type === filter || (filter === 'bump' && tx.source === 'bump'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted mt-1">Transaction history across all chains</p>
        </div>
        <div className="flex items-center gap-3">
          {solanaConnected && (
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'bump', 'transfer', 'swap', 'nft', 'stake'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-sm text-muted border-b border-border bg-surface-highlight">
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!anyConnected && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Connect a wallet to view transaction history</p>
                  </td>
                </tr>
              )}
              {anyConnected && filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Filter size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No transactions found. Start bumping or check back later.</p>
                  </td>
                </tr>
              )}
              {anyConnected && loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <RefreshCw size={32} className="mx-auto mb-4 animate-spin opacity-40" />
                    <p>Loading transaction history...</p>
                  </td>
                </tr>
              )}
              {filtered.map((tx) => {
                const typeInfo = typeLabels[tx.type] || typeLabels.unknown;
                const isEVM = tx.token === 'ETH' || tx.token === 'BNB';
                const explorerUrl = isEVM
                  ? (tx.token === 'BNB' ? `https://bscscan.com/tx/${tx.signature}` : `https://etherscan.io/tx/${tx.signature}`)
                  : `https://solscan.io/tx/${tx.signature}`;

                return (
                  <tr key={tx.signature} className="border-b border-border/50 last:border-0 hover:bg-surface-highlight/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {tx.source === 'bump' && (
                        <span className="ml-2 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">APP</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {statusIcons[tx.status]}
                        <span className="text-sm capitalize">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {tx.amount > 0 ? `${tx.amount.toFixed(6)} ${tx.token}` : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {shortenTx(tx.signature)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">
                      {formatTime(tx.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openExternal(explorerUrl)}
                        className="text-accent hover:text-accent-hover transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
