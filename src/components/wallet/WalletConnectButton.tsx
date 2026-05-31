import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut } from 'lucide-react';
import { formatAddress } from '../../lib/utils';

export default function WalletConnectButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border hover:border-danger rounded-lg text-sm font-medium transition-all text-white hover:text-danger"
        title="Disconnect wallet"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline font-mono">{formatAddress(publicKey.toBase58())}</span>
        <span className="sm:hidden font-mono">{formatAddress(publicKey.toBase58())}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent-hover rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/20"
    >
      <Wallet size={16} />
      <span>Connect Wallet</span>
    </button>
  );
}
