import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Webhook, Link2, Palette, Zap, Bell, Sun, Moon, Check } from 'lucide-react'
import { useSettingsStore } from '../stores/settingsStore'
import { useTheme } from '../hooks/useTheme'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const Settings: React.FC = () => {
  const {
    heliusApiKey,
    discordWebhookUrl,
    solanaRpcUrl,
    accentColor,
    maxBumpAmount,
    cooldownMs,
    notificationsEnabled,
    setHeliusApiKey,
    setDiscordWebhookUrl,
    setSolanaRpcUrl,
    setAccentColor,
    setMaxBumpAmount,
    setCooldownMs,
    setNotificationsEnabled,
    setTheme,
  } = useSettingsStore()

  const { theme, toggle } = useTheme()
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const colors = [
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'rose', class: 'bg-rose-500' },
    { id: 'amber', class: 'bg-amber-500' },
  ]

  const handleTestWebhook = async () => {
    if (!discordWebhookUrl) return
    try {
      const res = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Artemis X-II webhook test successful.' }),
      })
      setTestStatus(res.ok ? 'success' : 'error')
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-3xl space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure your API keys, preferences, and appearance.</p>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Theme</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setTheme('dark'); applyTheme('dark') }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                onClick={() => { setTheme('light'); applyTheme('light') }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                  theme === 'light'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${c.class} transition-transform hover:scale-110 ${
                    accentColor === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                  aria-label={`Select ${c.id} accent`}
                >
                  {accentColor === c.id && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Key size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">API Keys</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Helius API Key</label>
            <input
              type="password"
              value={heliusApiKey}
              onChange={(e) => setHeliusApiKey(e.target.value)}
              placeholder="Enter your Helius API key"
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Required for live portfolio data, NFT gallery, and transaction history.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Discord Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleTestWebhook}
                disabled={!discordWebhookUrl}
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {testStatus === 'success' ? 'Sent!' : testStatus === 'error' ? 'Failed' : 'Test'}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Solana RPC URL</label>
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-slate-400 dark:text-slate-500" />
              <input
                type="url"
                value={solanaRpcUrl}
                onChange={(e) => setSolanaRpcUrl(e.target.value)}
                placeholder="https://api.mainnet-beta.solana.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Zap size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Bump Engine</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Max Bump Amount (lamports)</label>
            <input
              type="number"
              value={maxBumpAmount}
              onChange={(e) => setMaxBumpAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Safety cap per transaction. 1000 lamports = ~0.001 SOL.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Cooldown (ms)</label>
            <input
              type="number"
              value={cooldownMs}
              onChange={(e) => setCooldownMs(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Minimum delay between bumps in milliseconds.</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Bell size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Browser alerts when bumps complete or fail.</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-purple-500' : 'bg-slate-400 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function applyTheme(t: 'dark' | 'light') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (t === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}
