import { useState, useMemo } from 'react';
import { useWalletData } from '../hooks/useWalletData';
import { useEVMWalletData } from '../hooks/useEVMWalletData';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useEVMPrices } from '../hooks/useEVMPrices';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCoinGeckoId } from '../lib/api';

export default function Portfolio() {
  const [selectedChain, setSelectedChain] = useState('solana');

  // Solana data
  const { connected: solanaConnected, solBalance, tokens, loading: solanaLoading, refetch: refetchSolana } = useWalletData();
  const { publicKey } = useWallet();

  // EVM data
  const { isConnected: evmConnected, balances: evmBalances, address: evmAddress } = useEVMWalletData();
  const { address: evmAccount } = useAccount();

  // Prices
  const allMints = useMemo(() =>
    ['So11111111111111111111111111111111111111112', ...tokens.map(t => t.mint)],
    [tokens]
  );
  const { prices: solPrices, loading: solPricesLoading, refetch: refetchSolPrices } = useTokenPrices(allMints);
  const evmChains = useMemo(() => ['ethereum', 'bsc'], []);
  const { prices: evmPrices, loading: evmPricesLoading, refetch: refetchEVMPrices } = useEVMPrices(evmChains);

  const solPrice = solPrices['So11111111111111111111111111111111111111112']?.current_price || 0;
  const solChange = solPrices['So11111111111111111111111111111111111111112']?.price_change_percentage_24h || 0;

  // Real EVM prices
  const ethPrice = evmPrices['ethereum']?.current_price || 0;
  const ethChange = evmPrices['ethereum']?.price_change_percentage_24h || 0;
  const bnbPrice = evmPrices['bsc']?.current_price || 0;
  const bnbChange = evmPrices['bsc']?.price_change_percentage_24h || 0;

  // Calculate totals per chain
  const solanaValue = solBalance * solPrice + tokens.reduce((acc, t) => {
    const price = solPrices[t.mint]?.current_price;
    return acc + (price ? t.balance * price : 0);
  }, 0);

  const ethBalance = evmBalances.find(b => b.chain === 'ethereum')?.balance || 0;
  const bscBalance = evmBalances.find(b => b.chain === 'bsc')?.balance || 0;

  const totalValue = selectedChain === 'solana' ? solanaValue 
    : selectedChain === 'ethereum' ? ethBalance * ethPrice 
    : selectedChain === 'bsc' ? bscBalance * bnbPrice 
    : solanaValue + (ethBalance * ethPrice) + (bscBalance * bnbPrice);

  const isLoading = solanaLoading || solPricesLoading || evmPricesLoading;
  const connected = selectedChain === 'solana' ? solanaConnected : selectedChain === 'ethereum' || selectedChain === 'bsc' ? evmConnected : (solanaConnected || evmConnected);

  const handleRefresh = () => {
    if (selectedChain === 'solana') {
      refetchSolana();
      refetchSolPrices();
    }
    refetchEVMPrices();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted mt-1">Multi-chain asset overview</p>
        </div>
        <div className="flex items-center gap-3">
          {connected && selectedChain === 'solana' && (
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
            {selectedChain === 'solana' && solanaConnected && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(solChange).toFixed(2)}% (24h)
              </p>
            )}
            {selectedChain === 'ethereum' && evmConnected && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${ethChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {ethChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(ethChange).toFixed(2)}% (24h)
              </p>
            )}
            {selectedChain === 'bsc' && evmConnected && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${bnbChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {bnbChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(bnbChange).toFixed(2)}% (24h)
              </p>
            )}
          </div>
          <div className="text-sm text-muted">
            {selectedChain === 'solana' && publicKey && (
              <span className="font-mono">{publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}</span>
            )}
            {(selectedChain === 'ethereum' || selectedChain === 'bsc') && evmAddress && (
              <span className="font-mono">{evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}</span>
            )}
          </div>
        </div>

        {/* Solana Portfolio */}
        {selectedChain === 'solana' && solanaConnected && (
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
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">S</div>
                      <div>
                        <p className="font-medium">Solana</p>
                        <p className="text-xs text-muted">SOL</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-sm">{solBalance.toFixed(4)}</td>
                  <td className="py-4 font-mono text-sm">{solPricesLoading ? '...' : solPrice > 0 ? `$${solPrice.toFixed(2)}` : '—'}</td>
                  <td className="py-4 font-mono text-sm">${(solBalance * solPrice).toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`flex items-center gap-1 text-sm ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(solChange).toFixed(2)}%
                    </span>
                  </td>
                </tr>
                {tokens.map((token) => {
                  const price = solPrices[token.mint]?.current_price;
                  const change = solPrices[token.mint]?.price_change_percentage_24h || 0;
                  return (
                    <tr key={token.mint} className="border-b border-border/50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-xs font-bold text-muted">{token.symbol[0]}</div>
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-xs text-muted font-mono">{token.mint.slice(0, 6)}...{token.mint.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-sm">{token.balance.toLocaleString()}</td>
                      <td className="py-4 font-mono text-sm">{solPricesLoading ? '...' : price ? `$${price < 0.01 ? price.toExponential(2) : price.toFixed(4)}` : '—'}</td>
                      <td className="py-4 font-mono text-sm">{price ? `$${(token.balance * price).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}</td>
                      <td className="py-4">
                        {price ? (
                          <span className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(change).toFixed(2)}%
                          </span>
                        ) : <span className="text-muted text-sm">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* EVM Portfolio */}
        {(selectedChain === 'ethereum' || selectedChain === 'bsc') && evmConnected && (
          <div className="space-y-4">
            {selectedChain === 'ethereum' && (
              <div className="bg-surface-highlight border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">E</div>
                  <div>
                    <p className="font-medium">Ethereum</p>
                    <p className="text-xs text-muted">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{ethBalance.toFixed(6)} ETH</p>
                  <p className="text-xs text-muted">${(ethBalance * ethPrice).toFixed(2)}</p>
                  {ethChange !== 0 && (
                    <p className={`text-xs flex items-center justify-end gap-1 mt-1 ${ethChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {ethChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(ethChange).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            )}
            {selectedChain === 'bsc' && (
              <div className="bg-surface-highlight border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-400">B</div>
                  <div>
                    <p className="font-medium">BNB Chain</p>
                    <p className="text-xs text-muted">BNB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{bscBalance.toFixed(6)} BNB</p>
                  <p className="text-xs text-muted">${(bscBalance * bnbPrice).toFixed(2)}</p>
                  {bnbChange !== 0 && (
                    <p className={`text-xs flex items-center justify-end gap-1 mt-1 ${bnbChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {bnbChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(bnbChange).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-muted text-center py-4">
              Full EVM token support coming in next update
            </p>
          </div>
        )}

        {/* Disconnected states */}
        {selectedChain === 'solana' && !solanaConnected && (
          <div className="py-12 text-center text-muted">
            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
            <p>Connect your Solana wallet to view portfolio</p>
          </div>
        )}
        {(selectedChain === 'ethereum' || selectedChain === 'bsc') && !evmConnected && (
          <div className="py-12 text-center text-muted">
            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
            <p>Connect your MetaMask wallet to view {selectedChain === 'bsc' ? 'BSC' : 'Ethereum'} portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
}
