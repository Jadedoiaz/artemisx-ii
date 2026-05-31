import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpEngine } from '../hooks/useBumpEngine';
import { useEVMBumpEngine } from '../hooks/useEVMBumpEngine';
import { useBumpStore } from '../stores/bumpStore';
import { Play, Pause, Zap, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

const CHAINS = [
  { id: 'solana', name: 'Solana', color: 'bg-purple-500', symbol: 'SOL' },
  { id: 'bsc', name: 'BSC', color: 'bg-yellow-500', symbol: 'BNB' },
  { id: 'ethereum', name: 'Ethereum', color: 'bg-blue-500', symbol: 'ETH' },
];

const PRESETS = [
  { name: 'Quick', amount: '0.001', interval: '5' },
  { name: 'Standard', amount: '0.01', interval: '30' },
  { name: 'Aggressive', amount: '0.05', interval: '10' },
];

export default function BumpCenter() {
  const [activeChain, setActiveChain] = useState('solana');
  const [amount, setAmount] = useState('0.001');
  const [interval, setInterval] = useState('5');

  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const { isBumping, setBumping, setActiveChain: setStoredChain } = useBumpStore();

  const solanaBump = useBumpEngine();
  const evmBump = useEVMBumpEngine();

  const isEVM = activeChain === 'ethereum' || activeChain === 'bsc';
  const walletConnected = isEVM ? evmConnected : solanaConnected;
  const bumpEngine = isEVM ? evmBump : solanaBump;

  const handleChainChange = (chainId: string) => {
    setActiveChain(chainId);
    setStoredChain(chainId);
    // Stop any active bumping when switching chains
    if (isBumping) {
      bumpEngine.stopAutoBump();
    }
  };

  const handleStart = () => {
    if (isBumping) {
      bumpEngine.stopAutoBump();
    } else {
      if (isEVM) {
        evmBump.startAutoBump(parseFloat(amount), parseInt(interval), activeChain as 'ethereum' | 'bsc');
      } else {
        solanaBump.startAutoBump(parseFloat(amount), parseInt(interval));
      }
    }
  };

  const handleManualBump = () => {
    if (isEVM) {
      evmBump.sendBump(parseFloat(amount), activeChain as 'ethereum' | 'bsc');
    } else {
      solanaBump.sendBump(parseFloat(amount));
    }
  };

  const chainInfo = CHAINS.find(c => c.id === activeChain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bump Center</h1>
        <p className="text-muted mt-1">Configure and execute bump transactions</p>
      </div>

      {!walletConnected && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3 text-warning">
          <Wallet size={20} />
          <span className="text-sm">
            Connect your {isEVM ? 'MetaMask' : 'Solana'} wallet to start bumping
          </span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {CHAINS.map((chain) => (
          <button
            key={chain.id}
            onClick={() => handleChainChange(chain.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium transition-all',
              activeChain === chain.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface text-muted hover:text-white'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', chain.color)} />
            {chain.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            Bump Configuration
          </h3>

          <div>
            <label className="text-sm text-muted mb-1 block">
              Amount ({chainInfo?.symbol || 'SOL'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
              step="0.0001"
              min="0"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Interval (seconds)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
              min="1"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-2 block">Presets</label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setAmount(preset.amount);
                    setInterval(preset.interval);
                  }}
                  className="px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleManualBump}
              disabled={!walletConnected || isBumping}
              className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-surface-highlight border border-border hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={18} />
              Manual Bump
            </button>
            <button
              onClick={handleStart}
              disabled={!walletConnected}
              className={cn(
                'flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                isBumping
                  ? 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                  : 'bg-accent text-white hover:bg-accent-hover'
              )}
            >
              {isBumping ? <Pause size={18} /> : <Play size={18} />}
              {isBumping ? 'Stop Auto-Bump' : 'Start Auto-Bump'}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Wallet</span>
              <span className={walletConnected ? 'text-success' : 'text-muted'}>
                {walletConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Active Chain</span>
              <span className="capitalize">{activeChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Auto-Bump</span>
              <span className={isBumping ? 'text-success' : 'text-muted'}>
                {isBumping ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Amount</span>
              <span className="font-mono">{amount} {chainInfo?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Interval</span>
              <span className="font-mono">{interval}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
