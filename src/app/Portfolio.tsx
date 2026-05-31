import { useState } from 'react';
import { useWalletData } from '../hooks/useWalletData';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCoinGeckoId } from '../lib/api';

export default function Portfolio() {
  const [selectedChain, setSelectedChain] = useState('solana');
  const { connected, solBalance, tokens, loading: walletLoading, refetch: refetchWallet } = useWalletData();

  // Get all mints for price lookup
  const allMints = ['So11111111111111111111111111111111111111112', ...tokens.map(t => t.mint)];
  const { prices, loading: pricesLoading, refetch: refetchPrices } = useTokenPrices(allMints);

  const solPrice = prices['So11111111111111111111111111111111111111112']?.current_price || 142.30;
  const solChange = prices['So11111111111111111111111111111111111111112']?.price_change_percentage_24h || 0;
  const totalValue = solBalance * solPrice + tokens.reduce((acc, t) => {
    const price = prices[t.mint]?.current_price;
    return acc + (price ? t.balance * price : 0);
  }, 0);

  const isLoading = walletLoading || pricesLoading;

  const handleRefresh = () => {
    refetchWallet();
    refetchPrices();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted mt-1">Multi-chain asset overview</p>
        </div>
        <div className="flex items-center gap-3">
          {connected && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
              Refresh
            </button>
          )}
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
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-muted">Total Value</p>
            <p className="text-3xl font-bold">
              {connected ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </p>
            {connected && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(solChange).toFixed(2)}% (24h)
              </p>
            )}
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
                {/* SOL Row */}
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
                  <td className="py-4 font-mono text-sm">
                    {pricesLoading ? '...' : `$${solPrice.toFixed(2)}`}
                  </td>
                  <td className="py-4 font-mono text-sm">${(solBalance * solPrice).toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`flex items-center gap-1 text-sm ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(solChange).toFixed(2)}%
                    </span>
                  </td>
                </tr>

                {/* Token Rows */}
                {tokens.map((token) => {
                  const price = prices[token.mint]?.current_price;
                  const change = prices[token.mint]?.price_change_percentage_24h || 0;
                  const hasPrice = getCoinGeckoId(token.mint) !== null;

                  return (
                    <tr key={token.mint} className="border-b border-border/50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-xs font-bold text-muted">
                            {token.symbol[0]}
                          </div>
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-xs text-muted font-mono">{token.mint.slice(0, 6)}...{token.mint.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-sm">{token.balance.toLocaleString()}</td>
                      <td className="py-4 font-mono text-sm">
                        {pricesLoading ? '...' : price ? `$${price < 0.01 ? price.toExponential(2) : price.toFixed(4)}` : hasPrice ? '...' : '—'}
                      </td>
                      <td className="py-4 font-mono text-sm">
                        {price ? `$${(token.balance * price).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-4">
                        {price ? (
                          <span className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedChain === 'solana' && !connected && (
          <div className="py-12 text-center text-muted">
            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
            <p>Connect your wallet to view live portfolio data</p>
          </div>
        )}

        {selectedChain !== 'solana' && (
          <div className="py-12 text-center text-muted">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>{selectedChain === 'bsc' ? 'BSC' : 'Ethereum'} portfolio coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
