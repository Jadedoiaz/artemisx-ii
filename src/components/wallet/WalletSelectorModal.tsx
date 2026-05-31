import { useCallback, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Wallet, ArrowUpRight, Loader2 } from 'lucide-react';
import { isMobileDevice, getMetaMaskDeepLink, getPhantomDeepLink } from '../../lib/evm';
import { cn } from '../../lib/utils';

interface WalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: 'solana' | 'bsc' | 'ethereum';
}

export default function WalletSelectorModal({ isOpen, onClose, chain }: WalletSelectorModalProps) {
  const isSolana = chain === 'solana';
  const isMobile = isMobileDevice();

  // EVM hooks
  const { connect: connectEVM, connectors: evmConnectors, isPending: evmConnecting } = useConnect();
  const { isConnected: evmConnected } = useAccount();

  // Solana hooks
  const { select: selectSolanaWallet, connect: connectSolana, wallets: solanaWallets, connected: solanaConnected } = useWallet();

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleEVMConnect = useCallback((connectorId: string) => {
    setConnectingId(connectorId);
    const connector = evmConnectors.find((c) => c.id === connectorId || c.name === connectorId);
    if (connector) {
      connectEVM({ connector }, {
        onSuccess: () => {
          setConnectingId(null);
          onClose();
        },
        onError: () => {
          setConnectingId(null);
        },
      });
    }
  }, [evmConnectors, connectEVM, onClose]);

  const handleSolanaConnect = useCallback(async (walletName: string) => {
    setConnectingId(walletName);
    try {
      // Cast to WalletName — the adapter library uses a branded string type
      selectSolanaWallet(walletName as Parameters<typeof selectSolanaWallet>[0]);
      await connectSolana();
      onClose();
    } catch {
      // Silently handle — user may have cancelled
    } finally {
      setConnectingId(null);
    }
  }, [selectSolanaWallet, connectSolana, onClose]);

  const openMetaMaskMobile = useCallback(() => {
    const link = getMetaMaskDeepLink();
    if (link) window.open(link, '_blank');
  }, []);

  const openPhantomMobile = useCallback(() => {
    const link = getPhantomDeepLink();
    if (link) window.open(link, '_blank');
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-surface border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isSolana ? 'Connect Solana Wallet' : 'Connect EVM Wallet'}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {isSolana ? 'Select a Solana wallet' : `Select a wallet for ${chain.toUpperCase()}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface-highlight"
            >
              <X size={18} />
            </button>
          </div>

          {/* Wallet Options */}
          <div className="p-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
            {isSolana ? (
              <>
                {/* Solana Wallets */}
                {isMobile ? (
                  /* Mobile: Deep link to Phantom */
                  <button
                    onClick={openPhantomMobile}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-surface-highlight group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Wallet size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Phantom</p>
                      <p className="text-xs text-muted">Open in Phantom app</p>
                    </div>
                    <ArrowUpRight size={16} className="text-muted group-hover:text-white transition-colors" />
                  </button>
                ) : (
                  /* Desktop: Browser wallets */
                  solanaWallets.map((w) => {
                    const name = w.adapter.name;
                    const isConnecting = connectingId === name;
                    return (
                      <button
                        key={name}
                        onClick={() => handleSolanaConnect(name)}
                        disabled={isConnecting}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                          'hover:bg-surface-highlight disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          {isConnecting ? (
                            <Loader2 size={18} className="text-purple-400 animate-spin" />
                          ) : (
                            <Wallet size={20} className="text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{name}</p>
                          <p className="text-xs text-muted">
                            {isConnecting ? 'Connecting...' : 'Browser extension'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            ) : (
              <>
                {/* EVM Wallets */}
                {isMobile ? (
                  /* Mobile: Deep link to MetaMask */
                  <button
                    onClick={openMetaMaskMobile}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-surface-highlight group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Wallet size={20} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">MetaMask</p>
                      <p className="text-xs text-muted">Open in MetaMask app</p>
                    </div>
                    <ArrowUpRight size={16} className="text-muted group-hover:text-white transition-colors" />
                  </button>
                ) : (
                  /* Desktop: Show available EVM connectors */
                  evmConnectors.map((connector) => {
                    const isConnecting = connectingId === connector.id;
                    const isMetaMask = connector.name?.toLowerCase().includes('metamask');
                    return (
                      <button
                        key={connector.id}
                        onClick={() => handleEVMConnect(connector.id)}
                        disabled={isConnecting || !connector.ready}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                          'hover:bg-surface-highlight disabled:opacity-40 disabled:cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          isMetaMask ? 'bg-orange-500/20' : 'bg-blue-500/20'
                        )}>
                          {isConnecting ? (
                            <Loader2 size={18} className={isMetaMask ? 'text-orange-400' : 'text-blue-400'} animate-spin />
                          ) : (
                            <Wallet size={20} className={isMetaMask ? 'text-orange-400' : 'text-blue-400'} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{connector.name}</p>
                          <p className="text-xs text-muted">
                            {isConnecting ? 'Connecting...' : !connector.ready ? 'Not installed' : 'Browser extension'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-border bg-surface-highlight/30">
            <p className="text-[11px] text-muted text-center">
              {isMobile
                ? `Don't have a wallet? Install ${isSolana ? 'Phantom' : 'MetaMask'} from your app store.`
                : `New to crypto? Install ${isSolana ? 'Phantom' : 'MetaMask'} browser extension first.`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
