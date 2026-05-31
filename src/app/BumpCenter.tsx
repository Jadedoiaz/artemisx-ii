import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Play, Square } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount } from 'wagmi'
import { useBumpStore } from '../stores/bumpStore'
import { useBumpEngine } from '../hooks/useBumpEngine'
import { useEVMBumpEngine } from '../hooks/useEVMBumpEngine'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const BumpCenter: React.FC = () => {
  const [amount, setAmount] = useState(0.001)
  const [interval, setInterval] = useState(30)
  const [chain, setChain] = useState<'solana' | 'bsc' | 'ethereum'>('solana')
  const { publicKey } = useWallet()
  const { address: evmAddress } = useAccount()
  const setActiveChain = useBumpStore((s) => s.setActiveChain)

  const solanaEngine = useBumpEngine()
  const evmEngine = useEVMBumpEngine(chain === 'solana' ? 'bsc' : chain)

  const isSolana = chain === 'solana'
  const engine = isSolana ? solanaEngine : evmEngine
  const connected = isSolana ? !!publicKey : !!evmAddress

  const handleChainChange = (c: 'solana' | 'bsc' | 'ethereum') => {
    setChain(c)
    setActiveChain(c)
  }

  const handleBump = () => {
    if (!connected) return
    if (isSolana) {
      engine.bump(Math.round(amount * 1e9))
    } else {
      engine.bump(amount)
    }
  }

  const handleStartAuto = () => {
    if (!connected) return
    if (isSolana) {
      engine.startAuto(Math.round(amount * 1e9), interval)
    } else {
      engine.startAuto(amount, interval)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-2xl space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bump Center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure and execute your bumps.</p>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex gap-2">
          {(['solana', 'bsc', 'ethereum'] as const).map((c) => (
            <button
              key={c}
              onClick={() => handleChainChange(c)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                chain === c
                  ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Amount {isSolana ? '(SOL)' : '(ETH/BNB)'}</label>
            <input
              type="number"
              step={isSolana ? 0.001 : 0.0001}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Interval (seconds)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Square size={16} />
                Stop Auto
              </button>
            ) : (
              <button
                onClick={handleStartAuto}
                disabled={!connected}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                <Play size={16} />
                Start Auto
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
