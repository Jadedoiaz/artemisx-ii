import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount, useDisconnect as useDisconnectEVM } from 'wagmi';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useBumpStore } from '../../stores/bumpStore';
import { isMobileDevice, getPhantomDeepLink, getMetaMaskDeepLink } from '../../lib/evm';
import WalletSelectorModal from './WalletSelectorModal';

export default function WalletConnectButton() {
  const { publicKey, disconnect: disconnectSolana, connected: solanaConnected } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { disconnect: disconnectEVM } = useDisconnectEVM();
  const activeChain = useBumpStore((s) => s.activeChain);
  const setActiveChain = useBumpStore((s) => s.setActiveChain);

  const [showWalletModal, setShowWalletModal] = useState(false);

  const isSolana = activeChain === 'solana';
  const isMobile = isMobileDevice();

  // FIX: Check both connected flag AND actual address/publicKey exists
  const isSolanaReallyConnected = solanaConnected && !!publicKey;
  const isEVMReallyConnected = evmConnected && !!evmAddress;

  const connected = isSolana ? isSolanaReallyConnected : isEVMReallyConnected;
  const address = isSolana ? publicKey?.toBase58() : evmAddress;

  const handleDisconnect = () => {
    if (isSolana) disconnectSolana();
    else disconnectEVM();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Chain selector */}
        <div className="relative">
          <select
            value={activeChain}
            onChange={(e) => setActiveChain(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-surface-highlight px-3 py-1.5 text-xs text-white pr-7 cursor-pointer focus:outline-none focus:border-accent"
          >
            <option value="solana">Solana</option>
            <option value="bsc">BSC</option>
            <option value="ethereum">Ethereum</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Wallet button */}
        {connected && address ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-white transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          >
            <span className="max-w-[80px] sm:max-w-[100px] truncate">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <LogOut size={14} />
          </button>
        ) : (
          <button
            onClick={() => {
              if (isMobileDevice()) {
                if (isSolana) {
                  window.location.href = getPhantomDeepLink();
                } else {
                  window.location.href = getMetaMaskDeepLink();
                }
                return;
              }
              setShowWalletModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-95"
          >
            <Wallet size={16} />
            {isMobile ? 'Open Wallet App' : 'Connect Wallet'}
          </button>
        )}
      </div>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        chain={activeChain as 'solana' | 'bsc' | 'ethereum'}
      />
    </>
  );
}
