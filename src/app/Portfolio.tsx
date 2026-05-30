import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const mockTokens = [
  { mint: 'SOL', name: 'Solana', balance: 12.5, price: 142.30, change24h: 2.4 },
  { mint: 'USDC', name: 'USD Coin', balance: 450.0, price: 1.0, change24h: 0.0 },
  { mint: 'BONK', name: 'Bonk', balance: 2500000, price: 0.000012, change24h: -5.2 },
];

export default function Portfolio() {
  const [selectedChain, setSelectedChain] = useState('solana');
  const totalValue = mockTokens.reduce((acc, t) => acc + t.balance * t.price, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-muted mt-1">Multi-chain asset overview</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-muted">Total Value</p>
            <p className="text-3xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
              {mockTokens.map((token) => (
                <tr key={token.mint} className="border-b border-border/50 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {token.mint[0]}
                      </div>
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-xs text-muted">{token.mint}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-sm">
                    {token.balance.toLocaleString()}
                  </td>
                  <td className="py-4 font-mono text-sm">
                    ${token.price < 0.01 ? token.price.toExponential(2) : token.price.toFixed(2)}
                  </td>
                  <td className="py-4 font-mono text-sm">
                    ${(token.balance * token.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4">
                    <span className={`flex items-center gap-1 text-sm ${
                      token.change24h >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {token.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(token.change24h)}%
                    </span>
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
