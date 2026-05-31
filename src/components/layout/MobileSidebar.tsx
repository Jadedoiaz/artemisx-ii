import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, LayoutDashboard, Zap, Wallet, Image, Activity, BarChart3, Settings } from 'lucide-react';
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const activeChain = useBumpStore((s) => s.activeChain);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-theme bg-theme-sidebar p-4"
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
              <Zap size={16} />
            </div>
            <span className="text-lg font-bold text-theme-primary">Artemis X-II</span>
          </div>
          <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
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
      </motion.aside>
    </>
  );
}
