import { Bell } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { useBumpStore } from '../../stores/bumpStore';
import WalletConnectButton from '../wallet/WalletConnectButton';

export default function Header() {
  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const activeChain = useBumpStore((s: { activeChain: string }) => s.activeChain);

  const totalConnected = (solanaConnected ? 1 : 0) + (evmConnected ? 1 : 0);

  return (
    <header className="h-16 bg-surface/80 backdrop-blur border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold capitalize">{activeChain}</h2>
        <span className="text-xs text-muted bg-surface-highlight px-2 py-1 rounded border border-border">
          {activeChain === 'solana' ? 'Mainnet' : activeChain === 'bsc' ? 'BSC Mainnet' : 'Ethereum Mainnet'}
        </span>
      </div>
      <div className="flex items-center gap-4">
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
