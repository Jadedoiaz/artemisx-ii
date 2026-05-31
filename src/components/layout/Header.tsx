import { Bell } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../../stores/bumpStore';
import WalletConnectButton from '../wallet/WalletConnectButton';
import { MobileMenuButton } from './MobileSidebar';
import { useSettingsStore } from '../../stores/settingsStore';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const activeChain = useBumpStore((s: { activeChain: string }) => s.activeChain);

  // FIX: Check both connected flag AND actual address/publicKey exists
  // This prevents stale publicKey from showing as "connected"
  const isSolanaReallyConnected = solanaConnected && !!publicKey;
  const isEVMReallyConnected = evmConnected && !!evmAddress;

  const totalConnected = (isSolanaReallyConnected ? 1 : 0) + (isEVMReallyConnected ? 1 : 0);

  return (
    <header className="h-16 bg-surface/80 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onMenuToggle} />
        <h2 className="text-lg font-semibold capitalize hidden sm:block">{activeChain}</h2>
        <span className="text-xs text-muted bg-surface-highlight px-2 py-1 rounded border border-border hidden md:inline-block">
          {activeChain === 'solana' ? 'Mainnet' : activeChain === 'bsc' ? 'BSC Mainnet' : 'Ethereum Mainnet'}
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        {totalConnected > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {totalConnected} wallet{totalConnected > 1 ? 's' : ''} connected
          </div>
        )}
        <button className="relative p-2 text-muted hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <WalletConnectButton />
      </div>
    </header>
  );
}
