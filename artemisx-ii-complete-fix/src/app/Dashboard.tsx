import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Wallet, Activity, CheckCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../stores/bumpStore';
import { useSettingsStore } from '../stores/settingsStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const Dashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const bumpCount = useBumpStore((s) => s.bumpCount);
  const successCount = useBumpStore((s) => s.successCount);
  const isBumping = useBumpStore((s) => s.isBumping);
  const accentColor = useSettingsStore((s) => s.accentColor);

  const stats = [
    { label: 'Total Bumps', value: bumpCount, icon: Zap, color: 'text-purple-400' },
    { label: 'Success Rate', value: bumpCount > 0 ? `${Math.round((successCount / bumpCount) * 100)}%` : '0%', icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Status', value: isBumping ? 'Active' : 'Idle', icon: Activity, color: isBumping ? 'text-amber-400' : 'text-slate-400' },
    { label: 'Wallets', value: (publicKey ? 1 : 0) + (evmAddress ? 1 : 0), icon: Wallet, color: 'text-blue-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-theme-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-theme-muted">Overview of your bumping activity and wallet status.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="rounded-xl border border-theme bg-theme-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-theme-primary">{stat.value}</p>
              </div>
              <stat.icon size={24} className={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-xl border border-theme bg-theme-card p-5">
          <h2 className="mb-4 font-semibold text-theme-primary">Quick Bump</h2>
          <p className="text-sm text-theme-muted">Go to Bump Center to start bumping.</p>
        </motion.div>
        <motion.div variants={item} className="rounded-xl border border-theme bg-theme-card p-5">
          <h2 className="mb-4 font-semibold text-theme-primary">Recent Activity</h2>
          <p className="text-sm text-theme-muted">Latest transactions will appear here.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
