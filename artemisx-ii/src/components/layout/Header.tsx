import { Bell, Wallet as WalletIcon } from 'lucide-react';
import { useWalletStore } from '../../stores/walletStore';

export default function Header() {
  const wallets = useWalletStore((s) => s.wallets);
  const connected = wallets.filter((w) => w.connected).length;

  return (
    <header className="h-16 bg-surface/80 backdrop-blur border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-highlight rounded-lg">
          <WalletIcon size={16} className="text-accent" />
          <span className="text-sm font-medium">
            {connected} Connected
          </span>
        </div>
      </div>
    </header>
  );
}
