import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Filter } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../stores/bumpStore';
import { useTransactionHistory, ParsedTransaction } from '../hooks/useTransactionHistory';
import { exportToCSV } from '../lib/export';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const Activity: React.FC = () => {
  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const walletAddress = publicKey?.toBase58() || evmAddress || undefined;

  const bumpTransactions = useBumpStore((s) => s.transactions);
  const { transactions: heliusTxs, loading, error, refetch } = useTransactionHistory(walletAddress);

  const [filter, setFilter] = useState<'all' | 'bump' | 'transfer' | 'swap' | 'nft' | 'stake'>('all');

  const bumpAsActivity: ParsedTransaction[] = bumpTransactions.map((tx) => ({
    id: tx.id,
    signature: tx.txId || tx.id,
    chain: tx.chain,
    type: tx.type,
    amount: tx.amount,
    token: 'SOL',
    status: tx.status,
    timestamp: tx.timestamp,
    from: tx.from,
    to: tx.to,
    txId: tx.txId,
    description: 'Bump transaction',
    fee: 0,
    source: 'bump' as const,
  }));

  const allTransactions = [...bumpAsActivity, ...heliusTxs].sort((a, b) => b.timestamp - a.timestamp);

  const filtered = filter === 'all' ? allTransactions : allTransactions.filter((tx) => tx.type === filter);

  const handleExport = () => {
    exportToCSV(allTransactions);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Activity</h1>
          <p className="mt-1 text-sm text-theme-muted">Transaction history and bump logs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-sm text-theme-secondary transition-colors hover:text-theme-primary"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {allTransactions.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-sm text-theme-secondary transition-colors hover:text-theme-primary"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-2">
        {(['all', 'bump', 'transfer', 'swap', 'nft', 'stake'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                : 'border-theme bg-theme-secondary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-theme bg-theme-card">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-theme-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-red-400">
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-theme-muted">
            <Filter size={40} className="mb-3 opacity-40" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-theme text-theme-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Chain</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="text-theme-primary">
                    <td className="px-4 py-3 capitalize">{tx.type}</td>
                    <td className="px-4 py-3 uppercase">{tx.chain}</td>
                    <td className="px-4 py-3">{tx.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-theme-muted">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.source === 'bump' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {tx.source === 'bump' ? 'APP' : 'CHAIN'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
