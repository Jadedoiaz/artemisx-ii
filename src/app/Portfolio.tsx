import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount } from 'wagmi'
import { useSettingsStore } from '../stores/settingsStore'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const Portfolio: React.FC = () => {
  const { publicKey } = useWallet()
  const { address: evmAddress } = useAccount()
  const [tab, setTab] = useState<'solana' | 'bsc' | 'ethereum'>('solana')
  const accentColor = useSettingsStore((s) => s.accentColor)

  const tokens = [
    { symbol: 'SOL', name: 'Solana', balance: 12.45, price: 142.30, change: 2.4 },
    { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, price: 1.00, change: 0.0 },
    { symbol: 'BONK', name: 'Bonk', balance: 2500000, price: 0.000012, change: -5.2 },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your token holdings across chains.</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-2">
        {(['solana', 'bsc', 'ethereum'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tokens.map((token) => (
                <tr key={token.symbol} className="text-slate-900 dark:text-white">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-${accentColor}-500 text-xs font-bold text-white`}>
                        {token.symbol[0]}
                      </div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{token.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">${token.price.toFixed(token.price < 0.01 ? 6 : 2)}</td>
                  <td className="px-4 py-3">${(token.balance * token.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      token.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {token.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(token.change)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
