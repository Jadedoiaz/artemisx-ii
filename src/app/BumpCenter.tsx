import { useState } from 'react';
import { useBumpStore } from '../stores/bumpStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Play, Pause, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const CHAINS = [
  { id: 'solana', name: 'Solana', color: 'bg-purple-500' },
  { id: 'bsc', name: 'BSC', color: 'bg-yellow-500' },
  { id: 'ethereum', name: 'Ethereum', color: 'bg-blue-500' },
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
  const { isBumping, setBumping, presets, addPreset, activeChain: storedChain, setActiveChain: setStoredChain } = useBumpStore();
  const { maxBumpAmount, cooldownMs } = useSettingsStore();

  const handleChainChange = (chainId: string) => {
    setActiveChain(chainId);
    setStoredChain(chainId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bump Center</h1>
        <p className="text-muted mt-1">Configure and execute bump transactions</p>
      </div>

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
              Amount ({activeChain === 'solana' ? 'SOL' : activeChain === 'bsc' ? 'BNB' : 'ETH'})
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
              min={Math.ceil(cooldownMs / 1000)}
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

          <button
            onClick={() => setBumping(!isBumping)}
            className={cn(
              'w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all',
              isBumping
                ? 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                : 'bg-accent text-white hover:bg-accent-hover'
            )}
          >
            {isBumping ? <Pause size={18} /> : <Play size={18} />}
            {isBumping ? 'Stop Bumping' : 'Start Bumping'}
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Safety Controls</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Max Amount</span>
              <span className="font-mono">{maxBumpAmount} lamports</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Cooldown</span>
              <span className="font-mono">{cooldownMs}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className={isBumping ? 'text-success' : 'text-muted'}>
                {isBumping ? 'Active' : 'Idle'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Active Chain</span>
              <span className="capitalize">{activeChain}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
