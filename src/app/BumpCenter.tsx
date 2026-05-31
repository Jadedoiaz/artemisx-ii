import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Square } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../stores/bumpStore';
import { useBumpEngine } from '../hooks/useBumpEngine';
import { useEVMBumpEngine } from '../hooks/useEVMBumpEngine';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const BumpCenter: React.FC = () => {
  const [amount, setAmount] = useState(0.001);
  const [interval, setInterval] = useState(30);
  const [chain, setChain] = useState<'solana' | 'bsc' | 'ethereum'>('solana');
  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const setActiveChain = useBumpStore((s) => s.setActiveChain);

  const solanaEngine = useBumpEngine();
  const evmEngine = useEVMBumpEngine(chain === 'solana' ? 'bsc' : chain);

  const isSolana = chain === 'solana';
  const engine = isSolana ? solanaEngine : evmEngine;
  const connected = isSolana ? !!publicKey : !!evmAddress;

  const handleChainChange = (c: 'solana' | 'bsc' | 'ethereum') => {
    setChain(c);
    setActiveChain(c);
  };

  const handleBump = () => {
    if (!connected) return;
    if (isSolana) {
      engine.bump(Math.round(amount * 1e9));
    } else {
      engine.bump(amount);
    }
  };

  const handleStartAuto = () => {
    if (!connected) return;
    if (isSolana) {
      engine.startAuto(Math.round(amount * 1e9), interval);
    } else {
      engine.startAuto(amount, interval);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-2xl space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-theme-primary">Bump Center</h1>
        <p className="mt-1 text-sm text-theme-muted">Configure and execute your bumps.</p>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-theme bg-theme-card p-5">
        <div className="mb-4 flex gap-2">
          {(['solana', 'bsc', 'ethereum'] as const).map((c) => (
            <button
              key={c}
              onClick={() => handleChainChange(c)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                chain === c
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-theme bg-theme-secondary text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-theme-secondary">Amount {isSolana ? '(SOL)' : '(ETH/BNB)'}</label>
            <input
              type="number"
              step={isSolana ? 0.001 : 0.0001}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-sm text-theme-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-theme-secondary">Interval (seconds)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-sm text-theme-primary focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBump}
              disabled={!connected || engine.isBumping}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
            >
              <Zap size={16} />
              Manual Bump
            </button>
            {engine.autoBump ? (
              <button
                onClick={engine.stopAuto}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Square size={16} />
                Stop Auto
              </button>
            ) : (
              <button
                onClick={handleStartAuto}
                disabled={!connected}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-secondary px-4 py-2.5 text-sm font-medium text-theme-primary transition-colors hover:bg-theme-primary hover:text-white disabled:opacity-50"
              >
                <Play size={16} />
                Start Auto
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
