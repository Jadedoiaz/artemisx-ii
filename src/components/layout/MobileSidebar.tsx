import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../../stores/bumpStore';
import {
  LayoutDashboard,
  Zap,
  Wallet,
  Activity,
  BarChart3,
  Settings,
  Image,
  X,
  Menu,
} from 'lucide-react';
import { formatAddress } from '../../lib/utils';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bump', icon: Zap, label: 'Bump Center' },
  { to: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { to: '/nfts', icon: Image, label: 'NFT Gallery' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// Route component map for preloading
const routePreloads: Record<string, () => Promise<any>> = {
  '/': () => import('../../app/Dashboard'),
  '/bump': () => import('../../app/BumpCenter'),
  '/portfolio': () => import('../../app/Portfolio'),
  '/nfts': () => import('../../app/NFTGallery'),
  '/activity': () => import('../../app/Activity'),
  '/analytics': () => import('../../app/Analytics'),
  '/settings': () => import('../../app/Settings'),
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const activeChain = useBumpStore((s: { activeChain: string }) => s.activeChain);

  const isEVM = activeChain === 'ethereum' || activeChain === 'bsc';
  const showWallet = isEVM ? evmConnected : solanaConnected;
  const walletAddress = isEVM ? evmAddress : (publicKey?.toBase58() || null);

  const handleMouseEnter = (to: string) => {
    const preload = routePreloads[to];
    if (preload) preload();
  };

  // Close on route change
  useEffect(() => {
    if (isOpen) onClose();
  }, [window.location.pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-72 bg-surface border-r border-border z-50 flex flex-col lg:hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-accent">Artemis</span> X-II
              </h1>
              <button 
                onClick={onClose}
                className="p-2 text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {showWallet && walletAddress && (
              <div className="px-4 py-3 border-b border-border bg-surface-highlight/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-muted">{isEVM ? 'MetaMask' : 'Solana'} Connected</span>
                </div>
                <p className="text-xs font-mono text-accent mt-1 truncate">
                  {formatAddress(walletAddress)}
                </p>
              </div>
            )}

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onMouseEnter={() => handleMouseEnter(item.to)}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted hover:text-white hover:bg-surface-highlight'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted text-center">
                v2.4.0 Extended
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-muted hover:text-white transition-colors"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
