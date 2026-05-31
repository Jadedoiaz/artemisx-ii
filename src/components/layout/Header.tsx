import { Bell } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletConnectButton from '../wallet/WalletConnectButton';

export default function Header() {
  const { connected } = useWallet();

  return (
    <header className="h-16 bg-surface/80 backdrop-blur border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="min-w-[140px]">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
