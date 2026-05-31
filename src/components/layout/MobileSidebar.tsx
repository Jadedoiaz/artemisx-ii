import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const activeChain = useBumpStore((s: { activeChain: string }) => s.activeChain);

  const isEVM = activeChain === 'ethereum' || activeChain === 'bsc';
  const showWallet = isEVM ? evmConnected : solanaConnected;
  const walletAddress = isEVM ? evmAddress : (publicKey?.toBase58() || null);

  // Close sidebar on route change - use location.pathname dependency
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <>
      {/* Backdrop - only rendered when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel - CSS transform for GPU-accelerated animation */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-72 bg-surface border-r border-border z-[70] flex flex-col lg:hidden',
          'transition-transform duration-300 ease-out will-change-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isOpen}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-accent">Artemis</span> X-II
          </h1>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-white transition-colors"
            aria-label="Close menu"
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
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <button
                key={item.to}
                onClick={() => handleNavClick(item.to)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-white hover:bg-surface-highlight'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted text-center">v2.4.2 Mobile Fix</div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-muted hover:text-white transition-colors active:scale-95"
      aria-label="Open menu"
      type="button"
    >
      <Menu size={20} />
    </button>
  );
}
