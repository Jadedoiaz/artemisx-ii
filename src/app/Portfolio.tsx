import { useState } from 'react';
import { useWalletData } from '../hooks/useWalletData';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Portfolio() {
  const [selectedChain, setSelectedChain] = useState('solana');
  const { connected, solBalance, tokens, loading, refetch } = useWalletData();

  const totalValue = solBalance * 142.30; // Mock SOL price until live feed

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted mt-1">Multi-chain asset overview</p>
        </div>
        {connected && (
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

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-muted">Total Value</p>
            <p className="text-3xl font-bold">
              {connected ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </p>
          </div>
          <div className="flex gap-2">
            {['solana', 'bsc', 'ethereum'].map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-4 py-2 rounded-lg text-sm capitalize border transition-colors ${
                  selectedChain === chain
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:text-white'
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        {selectedChain === 'solana' && connected && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-sm text-muted border-b border-border">
                  <th className="pb-3 font-medium">Token</th>
                  <th className="pb-3 font-medium">Balance</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Value</th>
                  <th className="pb-3 font-medium">24h</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        S
                      </div>
                      <div>
                        <p className="font-medium">Solana</p>
                        <p className="text-xs text-muted">SOL</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-sm">{solBalance.toFixed(4)}</td>
                  <td className="py-4 font-mono text-sm">$142.30</td>
                  <td className="py-4 font-mono text-sm">${(solBalance * 142.30).toFixed(2)}</td>
                  <td className="py-4">
                    <span className="flex items-center gap-1 text-sm text-success">
                      <TrendingUp size={14} />2.4%
                    </span>
                  </td>
                </tr>
                {tokens.map((token) => (
                  <tr key={token.mint} className="border-b border-border/50 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-xs font-bold text-muted">
                          {token.symbol[0]}
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-muted font-mono">{token.mint}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-sm">{token.balance.toLocaleString()}</td>
                    <td className="py-4 font-mono text-sm">—</td>
                    <td className="py-4 font-mono text-sm">—</td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 text-sm text-muted">
                        <TrendingDown size={14} />—
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(!connected || selectedChain !== 'solana') && (
          <div className="py-12 text-center text-muted">
            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
            <p>{!connected ? 'Connect your wallet to view portfolio' : 'Chain not yet supported'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
