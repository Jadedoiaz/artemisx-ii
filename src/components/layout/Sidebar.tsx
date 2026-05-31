import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, Wallet, Image, Activity, BarChart3, Settings } from 'lucide-react';
import { useBumpStore } from '../../stores/bumpStore';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bump', icon: Zap, label: 'Bump Center' },
  { to: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { to: '/nfts', icon: Image, label: 'NFT Gallery' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const activeChain = useBumpStore((s) => s.activeChain);

  return (
    <nav className="flex h-full w-64 flex-col border-r border-theme bg-theme-sidebar p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
          <Zap size={16} />
        </div>
        <span className="text-lg font-bold text-theme-primary">Artemis X-II</span>
      </div>
      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto px-3 py-2 text-xs text-theme-muted">
        Chain: <span className="font-medium text-theme-primary uppercase">{activeChain}</span>
      </div>
    </nav>
  );
}
