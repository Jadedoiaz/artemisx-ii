import React from 'react';
import { NavLink } from 'react-router-dom';
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
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
              <Zap size={16} />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Artemis X-II</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
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
                    ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
          Chain: <span className="font-medium text-slate-900 uppercase dark:text-white">{activeChain}</span>
        </div>
      </aside>
    </>
  );
}
